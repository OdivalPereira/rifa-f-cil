import { useState, useMemo, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatRaffleNumber } from '@/lib/validators';
import { Search, Shuffle, Check, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NumberSelectorProps {
  raffleId: string;
  totalNumbers: number;
  quantityToSelect: number;
  soldNumbers: number[];
  pendingNumbers: number[];
  onConfirm: (numbers: number[]) => void;
  isLoading?: boolean;
}

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
  const [currentPage, setCurrentPage] = useState(0);
  const numbersPerPage = 500;

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

  // All unavailable numbers (sold + pending)
  const unavailableNumbers = useMemo(() => {
    return new Set([...soldNumbers, ...pendingNumbers]);
  }, [soldNumbers, pendingNumbers]);

  // Generate available numbers for current page
  const displayedNumbers = useMemo(() => {
    const start = currentPage * numbersPerPage + 1;
    const end = Math.min((currentPage + 1) * numbersPerPage, totalNumbers);
    const numbers: number[] = [];

    if (searchTerm) {
      // Search mode: show matching numbers
      for (let i = 1; i <= totalNumbers; i++) {
        if (formatRaffleNumber(i, 5).includes(searchTerm)) {
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
  }, [currentPage, totalNumbers, searchTerm]);

  const totalPages = Math.ceil(totalNumbers / numbersPerPage);

  const toggleNumber = useCallback((num: number) => {
    if (unavailableNumbers.has(num)) return;

    setSelectedNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(num)) {
        newSet.delete(num);
      } else if (newSet.size < quantityToSelect) {
        newSet.add(num);
      }
      return newSet;
    });
  }, [unavailableNumbers, quantityToSelect]);

  const generateRandomNumbers = useCallback(() => {
    const available: number[] = [];
    for (let i = 1; i <= totalNumbers; i++) {
      if (!unavailableNumbers.has(i) && !selectedNumbers.has(i)) {
        available.push(i);
      }
    }

    const remaining = quantityToSelect - selectedNumbers.size;
    const shuffled = available.sort(() => Math.random() - 0.5);
    const newNumbers = shuffled.slice(0, remaining);

    setSelectedNumbers((prev) => {
      const newSet = new Set(prev);
      newNumbers.forEach((n) => newSet.add(n));
      return newSet;
    });
  }, [totalNumbers, unavailableNumbers, selectedNumbers, quantityToSelect]);

  const clearSelection = () => {
    setSelectedNumbers(new Set());
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedNumbers).sort((a, b) => a - b));
  };

  const getNumberStatus = (num: number) => {
    if (soldNumbers.includes(num)) return 'sold';
    if (pendingNumbers.includes(num)) return 'pending';
    if (selectedNumbers.has(num)) return 'selected';
    return 'available';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-display">Escolha seus Números</CardTitle>
        <CardDescription>
          Selecione {quantityToSelect} números ou gere automaticamente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={generateRandomNumbers}
              disabled={selectedNumbers.size >= quantityToSelect}
              className="border-gold/30 hover:bg-gold/10"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Gerar Automático
            </Button>
            <Button
              variant="ghost"
              onClick={clearSelection}
              disabled={selectedNumbers.size === 0}
            >
              <X className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-secondary border border-border" />
            <span className="text-muted-foreground">Disponível</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gold" />
            <span className="text-muted-foreground">Selecionado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/50" />
            <span className="text-muted-foreground">Vendido</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning/50" />
            <span className="text-muted-foreground">Reservado</span>
          </div>
        </div>

        {/* Selection counter */}
        <div className="flex justify-between items-center p-3 rounded-lg bg-secondary/50">
          <span className="text-muted-foreground">Números selecionados</span>
          <span className="text-lg font-bold">
            <span className={selectedNumbers.size === quantityToSelect ? 'text-success' : 'text-gold'}>
              {selectedNumbers.size}
            </span>
            <span className="text-muted-foreground"> / {quantityToSelect}</span>
          </span>
        </div>

        {/* Numbers grid */}
        <ScrollArea className="h-[400px] rounded-lg border border-border p-4">
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {displayedNumbers.map((num) => {
              const status = getNumberStatus(num);
              return (
                <button
                  key={num}
                  onClick={() => toggleNumber(num)}
                  disabled={status === 'sold' || status === 'pending'}
                  className={cn(
                    'aspect-square flex items-center justify-center text-xs font-mono rounded-lg transition-all duration-200',
                    'hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold/50',
                    status === 'available' && 'bg-secondary hover:bg-secondary/80 border border-border cursor-pointer',
                    status === 'selected' && 'bg-gold text-primary-foreground shadow-gold animate-number-pop cursor-pointer',
                    status === 'sold' && 'bg-destructive/20 text-destructive/50 cursor-not-allowed',
                    status === 'pending' && 'bg-warning/20 text-warning/50 cursor-not-allowed'
                  )}
                >
                  {formatRaffleNumber(num, 5)}
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Pagination */}
        {!searchTerm && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página {currentPage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage === totalPages - 1}
            >
              Próxima
            </Button>
          </div>
        )}

        {/* Selected numbers display */}
        {selectedNumbers.size > 0 && (
          <div className="p-4 rounded-lg bg-gold/10 border border-gold/20">
            <p className="text-sm text-muted-foreground mb-2">Seus números:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(selectedNumbers)
                .sort((a, b) => a - b)
                .map((num) => (
                  <span
                    key={num}
                    className="px-2 py-1 rounded bg-gold text-primary-foreground text-xs font-mono"
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
          className="w-full py-6 text-lg bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold transition-all duration-300 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Reservando números...
            </>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Confirmar {quantityToSelect} números
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
