import { useState, useMemo, useCallback, useEffect, memo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRaffleNumber } from '@/lib/validators';
import { Search, Shuffle, Check, X, Loader2, Sparkles, Star, Coins, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';

interface NumberSelectorProps {
  raffleId: string;
  totalNumbers: number;
  quantityToSelect: number;
  soldNumbers: Set<number>;
  pendingNumbers: Set<number>;
  onConfirm: (numbers: number[]) => void;
  isLoading?: boolean;
}

// Optimization: Memoized button component to prevent unnecessary re-renders
interface NumberButtonProps {
  num: number;
  status: 'available' | 'selected' | 'sold' | 'pending';
  onClick: (num: number) => void;
}

const NumberButton = memo(({ num, status, onClick }: NumberButtonProps) => {
  const handleClick = useCallback(() => onClick(num), [onClick, num]);

  const getAriaLabel = () => {
    switch (status) {
      case 'available':
        return `Número ${num}, disponível`;
      case 'selected':
        return `Número ${num}, selecionado`;
      case 'sold':
        return `Número ${num}, vendido`;
      case 'pending':
        return `Número ${num}, reservado`;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'sold' || status === 'pending'}
      aria-label={getAriaLabel()}
      aria-pressed={status === 'selected'}
      className={cn(
        'aspect-square flex items-center justify-center text-[10px] sm:text-xs font-mono rounded-lg transition-all duration-200',
        'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/50',
        status === 'available' && 'number-slot-available cursor-pointer',
        status === 'selected' && 'number-slot-selected shadow-gold animate-number-pop cursor-pointer',
        status === 'sold' && 'bg-destructive/20 border border-destructive/30 text-destructive/50 cursor-not-allowed',
        status === 'pending' && 'bg-warning/20 border border-warning/30 text-warning/50 cursor-not-allowed'
      )}
    >
      {formatRaffleNumber(num, 5)}
    </button>
  );
});

NumberButton.displayName = 'NumberButton';

export function NumberSelector({
  raffleId,
  totalNumbers,
  quantityToSelect,
  soldNumbers,
  pendingNumbers,
  onConfirm,
  isLoading,
}: NumberSelectorProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentPage, setCurrentPage] = useState(0);
  const numbersPerPage = 500;

  // Optimization: Removed internal Set creation since props are now Sets.
  // This avoids O(N) iteration on every render/update of props.

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('raffle-numbers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'raffle_numbers',
          filter: `raffle_id=eq.${raffleId}`,
        },
        () => {
          // Invalidate/refetch handled by parent
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [raffleId]);

  // Optimization: Use refs for sold/pending numbers to stabilize callbacks
  // This prevents re-rendering all buttons when one number changes status (e.g. via realtime)
  const soldNumbersRef = useRef(soldNumbers);
  const pendingNumbersRef = useRef(pendingNumbers);

  useEffect(() => {
    soldNumbersRef.current = soldNumbers;
  }, [soldNumbers]);

  useEffect(() => {
    pendingNumbersRef.current = pendingNumbers;
  }, [pendingNumbers]);

  // Generate available numbers for current page
  const displayedNumbers = useMemo(() => {
    const start = currentPage * numbersPerPage + 1;
    const end = Math.min((currentPage + 1) * numbersPerPage, totalNumbers);
    const numbers: number[] = [];

    if (debouncedSearchTerm) {
      // Search mode: show matching numbers
      // Optimization: using debounced term prevents freezing on large datasets
      for (let i = 1; i <= totalNumbers; i++) {
        if (formatRaffleNumber(i, 5).includes(debouncedSearchTerm)) {
          numbers.push(i);
          if (numbers.length >= 100) break;
        }
      }
    } else {
      // Normal pagination
      for (let i = start; i <= end; i++) {
        numbers.push(i);
      }
    }

    return numbers;
  }, [currentPage, totalNumbers, debouncedSearchTerm]);

  const totalPages = Math.ceil(totalNumbers / numbersPerPage);

  const toggleNumber = useCallback((num: number) => {
    // Optimization: Check against refs to avoid recreating this function when sets change
    if (soldNumbersRef.current.has(num) || pendingNumbersRef.current.has(num)) return;

    setSelectedNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
      } else if (newSet.size < quantityToSelect) {
        newSet.add(num);
      }
      return newSet;
    });
  }, [quantityToSelect]);

  const generateRandomNumbers = useCallback(() => {
    const isSold = (n: number) => soldNumbersRef.current.has(n);
    const isPending = (n: number) => pendingNumbersRef.current.has(n);
    const remaining = quantityToSelect - selectedNumbers.size;

    if (remaining <= 0) return;

    // Optimization: Smart selection strategy based on occupancy
    // If < 75% numbers are taken, Rejection Sampling is O(k) vs O(N) for array building
    // This avoids allocating a massive array (e.g. 100k items) just to pick 10 numbers.
    const occupiedCount = soldNumbersRef.current.size + pendingNumbersRef.current.size + selectedNumbers.size;
    const occupancyRate = occupiedCount / totalNumbers;
    const newNumbers: number[] = [];

    if (occupancyRate < 0.75) {
      // Rejection Sampling Strategy (Fast Path)
      const generated = new Set<number>();
      // Safety break to prevent infinite loops (should not happen with < 0.75 occupancy)
      let attempts = 0;
      const maxAttempts = remaining * 20;

      while (generated.size < remaining && attempts < maxAttempts) {
        attempts++;
        const r = Math.floor(Math.random() * totalNumbers) + 1;

        if (!isSold(r) && !isPending(r) && !selectedNumbers.has(r) && !generated.has(r)) {
          generated.add(r);
          newNumbers.push(r);
        }
      }

      // If we failed to find enough numbers (extremely rare), fall through to array method
      if (newNumbers.length < remaining) {
        // This only happens if RNG is extremely unlucky
        // Reset and use the robust method
      } else {
        setSelectedNumbers((prev) => {
          const newSet = new Set(prev);
          newNumbers.forEach((n) => newSet.add(n));
          return newSet;
        });
        return;
      }
    }

    // Array Building Strategy (Robust Fallback)
    // Used when occupancy is high or rejection sampling failed
    const available: number[] = [];

    // Exclude numbers already picked in the failed fast path if any (though we reset usually)
    const existingPicks = new Set(newNumbers);

    for (let i = 1; i <= totalNumbers; i++) {
      if (!isSold(i) && !isPending(i) && !selectedNumbers.has(i) && !existingPicks.has(i)) {
        available.push(i);
      }
    }

    // Shuffle remaining needed
    const stillNeeded = remaining - newNumbers.length;

    if (available.length <= stillNeeded) {
      available.forEach((n) => newNumbers.push(n));
    } else {
      let m = available.length;
      for (let i = 0; i < stillNeeded; i++) {
        const r = Math.floor(Math.random() * m);
        newNumbers.push(available[r]);
        // Swap-delete: O(1)
        available[r] = available[m - 1];
        m--;
      }
    }

    setSelectedNumbers((prev) => {
      const newSet = new Set(prev);
      newNumbers.forEach((n) => newSet.add(n));
      return newSet;
    });
  }, [totalNumbers, selectedNumbers, quantityToSelect]);

  const clearSelection = () => {
    setSelectedNumbers(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedNumbers).sort((a, b) => a - b));
  };

  // Optimization: This function is now mostly used inside the render loop logic
  // but using sets makes it O(1).
  const getNumberStatus = (num: number): 'available' | 'selected' | 'sold' | 'pending' => {
    if (soldNumbers.has(num)) return 'sold';
    if (pendingNumbers.has(num)) return 'pending';
    if (selectedNumbers.has(num)) return 'selected';
    return 'available';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto card-jackpot border-gold/20 overflow-hidden">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />
      
      <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
        {/* Corner decorations - hidden on mobile */}
        <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
          <Trophy className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
          <Coins className="w-6 h-6" />
        </div>
        
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-luck flex items-center justify-center mb-2 glow-emerald animate-pulse-glow">
          <span className="text-2xl sm:text-3xl">🎰</span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-display text-gradient-luck">Escolha seus Números</CardTitle>
        <CardDescription className="text-sm">
          Selecione {quantityToSelect} números ou gere automaticamente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-3 sm:px-6">
        {/* Controls */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              inputMode="numeric"
              aria-label="Buscar número específico"
              placeholder="Buscar número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 input-casino"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateRandomNumbers}
              disabled={selectedNumbers.size >= quantityToSelect}
              className="flex-1 border-gold/30 hover:bg-gold/10 hover:border-gold bg-transparent text-xs sm:text-sm"
            >
              <Shuffle className="w-4 h-4 mr-1 sm:mr-2 text-gold" />
              <span className="hidden sm:inline">Gerar Automático</span>
              <span className="sm:hidden">Automático</span>
            </Button>
            <Button
              variant="ghost"
              onClick={clearSelection}
              disabled={selectedNumbers.size === 0}
              className="hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm"
            >
              <X className="w-4 h-4 mr-1 sm:mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm p-3 sm:p-4 rounded-xl card-casino border border-border">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg number-slot-available flex items-center justify-center text-[10px] sm:text-xs">0</div>
            <span className="text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg number-slot-selected flex items-center justify-center text-[10px] sm:text-xs">0</div>
            <span className="text-muted-foreground">Selecionado</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-destructive/30 border border-destructive/50 flex items-center justify-center text-[10px] sm:text-xs text-destructive/70">0</div>
            <span className="text-muted-foreground">Vendido</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-warning/30 border border-warning/50 flex items-center justify-center text-[10px] sm:text-xs text-warning/70">0</div>
            <span className="text-muted-foreground">Reservado</span>
          </div>
        </div>

        {/* Selection counter */}
        <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-gradient-to-r from-emerald/10 via-transparent to-gold/10 border border-emerald/20">
          <span className="text-muted-foreground flex items-center gap-1 sm:gap-2 text-sm">
            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
            Selecionados
          </span>
          <span className="text-lg sm:text-xl font-bold font-display">
            <span className={selectedNumbers.size === quantityToSelect ? 'text-success' : 'text-gold'}>
              {selectedNumbers.size}
            </span>
            <span className="text-muted-foreground"> / {quantityToSelect}</span>
          </span>
        </div>

        {/* Numbers grid */}
        <ScrollArea className="h-[300px] sm:h-[400px] rounded-xl border border-border p-2 sm:p-4 card-casino">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-1 sm:gap-2">
            {displayedNumbers.map((num) => {
              const status = getNumberStatus(num);
              return (
                <NumberButton
                  key={num}
                  num={num}
                  status={status}
                  onClick={toggleNumber}
                />
              );
            })}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {!debouncedSearchTerm && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="border-border hover:bg-secondary text-xs sm:text-sm px-2 sm:px-3"
            >
              Anterior
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground px-2 sm:px-4">
              <span className="text-gold font-bold">{currentPage + 1}</span>/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
              className="border-border hover:bg-secondary text-xs sm:text-sm px-2 sm:px-3"
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Selected numbers display */}
        {selectedNumbers.size > 0 && (
          <div className="p-3 sm:p-5 rounded-xl bg-gradient-to-br from-gold/10 via-transparent to-emerald/10 border border-gold/20">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3 flex items-center gap-2">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
              Seus números da sorte:
            </p>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {Array.from(selectedNumbers)
                .sort((a, b) => a - b)
                .map((num) => (
                  <span
                    key={num}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg number-slot-selected text-[10px] sm:text-xs font-mono font-bold"
                  >
                    {formatRaffleNumber(num, 5)}
                  </span>
                ))}
            </div>
          </div>
        )}

        {/* Confirm button */}
        <Button
          onClick={handleConfirm}
          disabled={selectedNumbers.size !== quantityToSelect || isLoading}
          className="btn-luck w-full py-5 sm:py-7 text-sm sm:text-lg font-bold uppercase tracking-wider"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
              Reservando...
            </>
          ) : (
            <>
              <span className="mr-2">🍀</span>
              Confirmar {quantityToSelect} números
              <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
