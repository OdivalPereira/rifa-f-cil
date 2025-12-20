import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrizeWheel } from './PrizeWheel';
import { RetryWheel } from './RetryWheel';
import { useSpinWheel, useAvailableSpins, SpinPrize } from '@/hooks/useSpinRewards';
import { Loader2, Sparkles, X, Trophy } from 'lucide-react';
import { formatRaffleNumber } from '@/lib/validators';
import confetti from 'canvas-confetti';

interface SpinRewardModalProps {
  raffleId: string;
  buyerEmail: string;
  buyerPhone: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpinRewardModal({ raffleId, buyerEmail, buyerPhone, isOpen, onOpenChange }: SpinRewardModalProps) {
  const [view, setView] = useState<'main' | 'retry' | 'result'>('main');
  const [isSpinning, setIsSpinning] = useState(false);
  const [prizeIndex, setPrizeIndex] = useState<number | null>(null);
  const [lastPrize, setLastPrize] = useState<SpinPrize | null>(null);
  const [bonusNumbers, setBonusNumbers] = useState<number[]>([]);

  const { data: spinData, refetch: refetchSpins } = useAvailableSpins(raffleId, buyerEmail, buyerPhone);
  const spinMutation = useSpinWheel();

  const spinsAvailable = spinData ? (spinData.total_spins - spinData.used_spins) : 0;

  useEffect(() => {
    if (isOpen) {
      refetchSpins();
      setView('main');
      setLastPrize(null);
      setBonusNumbers([]);
      setIsSpinning(false);
      setPrizeIndex(null);
    }
  }, [isOpen]);

  const handleSpin = async (type: 'main' | 'retry') => {
    if (isSpinning) return;

    setIsSpinning(true);

    try {
      const result = await spinMutation.mutateAsync({
        raffleId,
        buyerEmail,
        buyerPhone,
        spinType: type
      });

      // Map result to visual index
      let index = 0;
      if (type === 'main') {
        if (result.prize.type === 'fixed') {
            const map: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 };
            index = map[result.prize.amount] ?? 0;
        } else if (result.prize.type === 'retry') {
            index = 6;
        } else if (result.prize.type === 'multiplier') {
            const map: Record<number, number> = { 2: 7, 5: 8, 10: 9 };
            index = map[result.prize.amount] ?? 7;
        }
      } else {
        // Retry wheel indices
        if (result.prize.type === 'fixed') {
            index = result.prize.amount === 1 ? 0 : 1;
        } else {
            index = 2; // Nothing
        }
      }

      setPrizeIndex(index);
      setLastPrize(result.prize);
      setBonusNumbers(result.bonusNumbers || []);

    } catch (error) {
      console.error('Spin failed', error);
      setIsSpinning(false);
      // Show error toast?
    }
  };

  const onSpinComplete = () => {
    setIsSpinning(false);

    if (lastPrize?.type === 'retry') {
        setView('retry');
    } else {
        setView('result');
        if (lastPrize?.type !== 'nothing') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(val) => !isSpinning && onOpenChange(val)}>
      <DialogContent className="sm:max-w-md bg-slot-background border-gold/30 p-0 overflow-hidden">
        {/* Decorative Header */}
        <div className="h-2 bg-gradient-to-r from-gold-dark via-gold to-gold-dark" />

        <div className="p-6">
          <DialogHeader className="mb-4">
            <div className="flex justify-between items-start">
               <div>
                  <DialogTitle className="text-2xl font-display text-gradient-gold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-gold animate-sparkle" />
                    Roleta da Sorte
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {spinsAvailable > 0
                      ? `Você tem ${spinsAvailable} giros disponíveis!`
                      : "Gire para tentar ganhar prêmios extras!"}
                  </DialogDescription>
               </div>
               {!isSpinning && (
                 <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-white">
                   <X className="w-4 h-4" />
                 </Button>
               )}
            </div>
          </DialogHeader>

          <div className="min-h-[400px] flex flex-col items-center justify-center">
            {view === 'main' && (
                <>
                    <PrizeWheel
                        onSpinComplete={onSpinComplete}
                        isSpinning={isSpinning}
                        prizeIndex={prizeIndex}
                    />
                    <Button
                        onClick={() => handleSpin('main')}
                        disabled={isSpinning || spinsAvailable <= 0}
                        className="btn-luck w-full max-w-xs text-lg py-6 font-bold relative overflow-hidden group"
                    >
                        {isSpinning ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Girando...
                            </>
                        ) : spinsAvailable > 0 ? (
                            <>
                                <span className="relative z-10">GIRAR AGORA ({spinsAvailable})</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </>
                        ) : (
                            "Sem giros disponíveis"
                        )}
                    </Button>
                </>
            )}

            {view === 'retry' && (
                <>
                    <div className="text-center mb-4 animate-bounce-soft">
                        <h3 className="text-xl font-bold text-emerald-400">Segunda Chance!</h3>
                        <p className="text-sm text-gray-400">Gire a roleta especial para tentar novamente.</p>
                    </div>
                    <RetryWheel
                        onSpinComplete={onSpinComplete}
                        isSpinning={isSpinning}
                        prizeIndex={prizeIndex}
                    />
                    <Button
                         onClick={() => handleSpin('retry')}
                         disabled={isSpinning}
                         className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                    >
                        {isSpinning ? 'Girando...' : 'Girar Segunda Chance'}
                    </Button>
                </>
            )}

            {view === 'result' && (
                <div className="text-center space-y-6 animate-fade-in-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-gold/20 to-emerald/20 rounded-full flex items-center justify-center mx-auto ring-4 ring-gold/30">
                        {lastPrize?.type === 'nothing' ? (
                            <span className="text-4xl">😢</span>
                        ) : (
                            <Trophy className="w-12 h-12 text-gold animate-bounce" />
                        )}
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            {lastPrize?.type === 'nothing' ? 'Não foi dessa vez...' : 'Parabéns!'}
                        </h3>
                        <p className="text-lg text-emerald-400 font-medium">
                            {lastPrize?.type === 'fixed' && `Você ganhou +${lastPrize.amount} números!`}
                            {lastPrize?.type === 'multiplier' && `Você MULTIPLICOU seus números por ${lastPrize.amount}x!`}
                            {lastPrize?.type === 'nothing' && 'Tente novamente na próxima compra.'}
                        </p>
                    </div>

                    {bonusNumbers.length > 0 && (
                        <div className="bg-black/30 p-4 rounded-lg max-h-32 overflow-y-auto">
                            <p className="text-xs text-gray-400 mb-2">Seus novos números:</p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {bonusNumbers.map(n => (
                                    <span key={n} className="px-2 py-1 bg-emerald/20 text-emerald-400 text-xs rounded border border-emerald/20 font-mono">
                                        {formatRaffleNumber(n)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <Button
                        onClick={() => {
                            if (spinsAvailable > 0) setView('main');
                            else onOpenChange(false);
                            setPrizeIndex(null);
                        }}
                        className="btn-gold w-full"
                    >
                        {spinsAvailable > 0 ? 'Girar Novamente' : 'Fechar'}
                    </Button>
                </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
