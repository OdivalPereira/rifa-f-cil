import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Copy, Sparkles, Lock, Trophy, Share2, Loader2 } from 'lucide-react';
import { useUserTotalNumbers, useUserReferralCode, useGenerateReferralCode } from '@/hooks/useRaffle';

interface ReferralDashboardProps {
  phone: string | null;
}

export default function ReferralDashboard({ phone }: ReferralDashboardProps) {
  const { toast } = useToast();
  
  // Fetch user data
  const { data: totalNumbers, isLoading: numbersLoading } = useUserTotalNumbers(phone);
  const { data: userAccount, isLoading: accountLoading } = useUserReferralCode(phone);
  const generateCode = useGenerateReferralCode();

  const targetQuantity = 10;
  const currentQuantity = totalNumbers || 0;
  const progressPercentage = Math.min((currentQuantity / targetQuantity) * 100, 100);
  const isUnlocked = currentQuantity >= targetQuantity;
  const remainingQuantity = Math.max(0, targetQuantity - currentQuantity);

  // Auto-generate referral code if user has enough numbers but no code
  useEffect(() => {
    if (isUnlocked && userAccount && !userAccount.referral_code && !generateCode.isPending) {
      generateCode.mutate(userAccount.id);
    }
  }, [isUnlocked, userAccount, generateCode]);

  const referralCode = userAccount?.referral_code || '';
  const referralLink = referralCode 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : '';

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "Agora é só compartilhar e ganhar.",
        className: "bg-emerald-950 border-emerald-500 text-white",
      });
    } catch {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (!referralLink) return;
    const shareMessage = `Olá! Estou participando dessa rifa incrível. Compre seus números através do meu link e me ajude a ganhar: ${referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
  };

  const isLoading = numbersLoading || accountLoading;

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto mb-8 p-6 rounded-xl border-2 border-gold/30 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-gold" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 p-6 rounded-xl border-2 border-gold/30 bg-card/80 backdrop-blur-sm relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-radial-gold opacity-[0.03] group-hover:opacity-[0.05] transition-opacity" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
            <Trophy className="w-6 h-6 text-gold" />
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-gradient-gold">
              Programa de Indicação
            </h2>
            <p className="text-sm text-muted-foreground">
              Indique amigos e ganhe prêmios exclusivos!
            </p>
          </div>
        </div>

        {!isUnlocked ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Progresso para desbloqueio</span>
              <span className="text-gold font-medium">{currentQuantity} / {targetQuantity} números</span>
            </div>

            <div className="relative">
              <Progress value={progressPercentage} className="h-4 bg-muted/50 border border-border/50" />
              {remainingQuantity > 0 && (
                <div className="absolute top-0 right-0 -mt-8">
                  <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20 animate-pulse">
                    Faltam {remainingQuantity}!
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Compre {targetQuantity} números para desbloquear seu Link da Sorte 🍀
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald animate-pulse" />
                <span className="text-sm font-medium text-emerald">
                  Link da Sorte 🍀 Desbloqueado!
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Você tem <span className="text-gold font-bold">{currentQuantity} números</span>!
              </span>
            </div>

            {referralLink ? (
              <>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      readOnly
                      value={referralLink}
                      className="bg-muted/50 border-gold/30 text-gold font-mono text-sm pr-10 h-11"
                    />
                  </div>
                  <Button
                    onClick={handleCopy}
                    className="bg-gold hover:bg-gold-dark text-black font-bold h-11 px-6 shadow-glow-gold"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                </div>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="w-full mt-2 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] h-11"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar no WhatsApp
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gold mr-2" />
                <span className="text-sm text-muted-foreground">Gerando seu link...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}