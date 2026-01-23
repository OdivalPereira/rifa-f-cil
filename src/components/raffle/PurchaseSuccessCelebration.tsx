import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, CheckCircle, Copy, Check, ArrowRight, Sparkles, Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUserTotalNumbers, useUserReferralCode, useGenerateReferralCode } from '@/hooks/useRaffle';

interface PurchaseSuccessCelebrationProps {
  purchasedQuantity: number;
  buyerPhone: string;
}

export function PurchaseSuccessCelebration({
  purchasedQuantity,
  buyerPhone,
}: PurchaseSuccessCelebrationProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch real user data
  const { data: totalNumbers, isLoading: numbersLoading } = useUserTotalNumbers(buyerPhone);
  const { data: userAccount, isLoading: accountLoading } = useUserReferralCode(buyerPhone);
  const generateCode = useGenerateReferralCode();

  const targetQuantity = 10;
  const totalQuantity = totalNumbers || purchasedQuantity;
  const progressPercentage = Math.min((totalQuantity / targetQuantity) * 100, 100);
  const isUnlocked = totalQuantity >= targetQuantity;
  const remainingQuantity = Math.max(0, targetQuantity - totalQuantity);

  // Auto-generate referral code if user qualifies but doesn't have one
  useEffect(() => {
    if (isUnlocked && userAccount && !userAccount.referral_code && !generateCode.isPending) {
      generateCode.mutate(userAccount.id);
    }
  }, [isUnlocked, userAccount, generateCode]);

  const referralCode = userAccount?.referral_code || '';
  const referralLink = referralCode 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : '';

  useEffect(() => {
    // Trigger confetti on mount
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleCopyLink = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast({
        title: 'Link copiado!',
        description: 'Compartilhe com seus amigos.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie o link manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleBuyMore = () => {
    navigate('/');
  };

  const isLoading = numbersLoading || accountLoading;

  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden relative">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />

      <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
         {/* Corner decorations */}
         <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
          <Star className="w-6 h-6" />
        </div>

        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center mb-4 glow-emerald animate-bounce">
          {isUnlocked ? (
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          ) : (
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          )}
        </div>

        <CardTitle className="text-2xl sm:text-3xl font-display text-gradient-luck">
          Pagamento Confirmado!
        </CardTitle>
        <p className="text-muted-foreground">
          Você acabou de adquirir <span className="text-gold font-bold">{purchasedQuantity}</span> número(s).
        </p>
      </CardHeader>

      <CardContent className="space-y-6 pb-6 px-4 sm:px-6">
        {/* Gamification Section */}
        <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progresso para VIP</span>
                <span className="text-gold font-bold">{totalQuantity} / {targetQuantity}</span>
              </div>

              <Progress 
                value={progressPercentage} 
                className="h-3 bg-white/10" 
                indicatorClassName="bg-gradient-luck" 
              />

              {isUnlocked ? (
                <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <p className="text-sm sm:text-base font-medium text-emerald">
                    Parabéns! Você desbloqueou o Perfil de Indicador! 🏆
                  </p>

                  {referralLink ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Seu Link da Sorte</p>
                      <div className="flex gap-2">
                        <div className="flex-1 p-3 rounded-xl bg-black/40 border border-gold/30 font-mono text-xs sm:text-sm truncate text-gold">
                          {referralLink}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleCopyLink}
                          aria-label="Copiar link de indicação"
                          className="shrink-0 border-gold/30 hover:bg-gold/10 hover:border-gold h-11 w-11"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-success" />
                          ) : (
                            <Copy className="w-4 h-4 text-gold" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="w-5 h-5 animate-spin text-gold mr-2" />
                      <span className="text-sm text-muted-foreground">Gerando seu link...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-300">
                    Você tem <span className="text-white font-bold">{totalQuantity}</span> números.
                    Faltam apenas <span className="text-gold font-bold">{remainingQuantity}</span> para desbloquear seu
                    Link da Sorte e concorrer à viagem extra! ✈️
                  </p>

                  <Button
                    onClick={handleBuyMore}
                    className="w-full bg-gradient-luck hover:brightness-110 text-primary-foreground font-bold shadow-lg shadow-emerald/20"
                  >
                    Comprar mais números
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pb-8">
        <Button variant="link" asChild className="text-muted-foreground hover:text-white">
          <a href="/meus-numeros">Ver meus números</a>
        </Button>
      </CardFooter>
    </Card>
  );
}