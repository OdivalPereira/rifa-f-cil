import { formatCurrency } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Ticket, Gift, Timer, Sparkles, Star, Coins, Trophy, Zap, Medal, Crown, Users, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import rafflePrizesHero from '@/assets/raffle-prizes-hero.jpg';

interface RaffleHeroProps {
  title: string;
  description: string | null;
  prizeDescription: string;
  prizeDrawDetails?: string | null;

  // New Gamification Props
  prizeReferral1st?: string | null;
  referralThreshold?: number | null;
  prizeBuyer1st?: string | null;
  prizeReferralRunners?: string | null;
  prizeBuyerRunners?: string | null;

  // Legacy props (optional/unused but kept for interface compatibility if needed)
  prizeTopBuyer?: string | null;
  prizeTopBuyerDetails?: string | null;
  prizeSecondTopBuyer?: string | null;
  prizeSecondTopBuyerDetails?: string | null;

  imageUrl: string | null;
  pricePerNumber: number;
  totalNumbers: number;
  soldNumbers: number;
  drawDate: string | null;
  onParticipate: () => void;
}

export function RaffleHero({
  title,
  description,
  prizeDescription,
  prizeDrawDetails,
  prizeReferral1st,
  referralThreshold,
  prizeBuyer1st,
  prizeReferralRunners,
  prizeBuyerRunners,
  imageUrl,
  pricePerNumber,
  totalNumbers,
  soldNumbers,
  drawDate,
  onParticipate,
}: RaffleHeroProps) {
  const progressPercentage = (soldNumbers / totalNumbers) * 100;
  const availableNumbers = totalNumbers - soldNumbers;
  const [selectedPrize, setSelectedPrize] = useState<{
    title: string;
    details: string;
    icon: React.ReactNode;
  } | null>(null);

  const handlePrizeClick = (title: string, details: string | null, icon: React.ReactNode) => {
    if (!details) return;
    setSelectedPrize({
      title,
      details,
      icon,
    });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-6 px-4 space-y-12">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10 space-y-12">

        {/* --- MAIN HERO SECTION --- */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Text & Main Prize */}
          <div className="space-y-6 text-center lg:text-left w-full">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-emerald/10 border border-emerald/30 glow-emerald mx-auto lg:mx-0">
              <span className="text-emerald animate-sparkle">🍀</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald">Rifa da Sorte</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold animate-sparkle" />
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold leading-tight">
              <span className="text-gradient-luck">{title}</span>
            </h1>

            {description && (
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {description}
              </p>
            )}

            {/* Main Prize Highlight Card */}
            <div
              className="card-jackpot p-6 rounded-2xl border-2 border-gold/50 relative overflow-hidden group cursor-pointer hover:border-gold transition-all shadow-lg shadow-gold/10"
              onClick={() => handlePrizeClick('Prêmio Principal', prizeDrawDetails || null, <Gift className="w-10 h-10 text-gold" />)}
            >
              <div className="absolute top-0 right-0 p-3 bg-gold text-primary-foreground font-bold text-xs uppercase rounded-bl-xl z-20">
                1º Prêmio
              </div>
              <div className="flex items-center gap-4 relative z-10">
                 <div className="p-4 rounded-xl bg-gradient-gold animate-pulse-glow shrink-0 group-hover:scale-105 transition-transform">
                    <Gift className="w-8 h-8 text-purple-dark" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">{prizeDescription}</h3>
                    {prizeDrawDetails && (
                      <p className="text-sm text-muted-foreground mt-1 underline">Ver detalhes</p>
                    )}
                  </div>
              </div>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
               <div className="card-casino text-center p-3 rounded-xl border border-emerald/20">
                <p className="text-xl font-display font-bold text-emerald">{formatCurrency(pricePerNumber)}</p>
                <p className="text-[10px] text-muted-foreground uppercase">por número</p>
              </div>
              <div className="card-casino text-center p-3 rounded-xl border border-gold/20">
                <p className="text-xl font-display font-bold text-gold">{availableNumbers.toLocaleString()}</p>
                 <p className="text-[10px] text-muted-foreground uppercase">restantes</p>
              </div>
               <div className="card-casino text-center p-3 rounded-xl border border-purple/20">
                 {/* Progress circle or simple text */}
                 <p className="text-xl font-display font-bold text-purple">{progressPercentage.toFixed(0)}%</p>
                 <p className="text-[10px] text-muted-foreground uppercase">vendido</p>
              </div>
            </div>

            <Button 
              onClick={onParticipate}
              size="lg"
              className="btn-luck w-full text-lg py-8 text-primary-foreground font-bold uppercase tracking-wider shadow-xl shadow-emerald/20 hover:shadow-emerald/40 transition-all"
            >
              <span className="mr-2 text-2xl">🎟️</span>
              Comprar Números
            </Button>

            {drawDate && (
              <div className="flex justify-center lg:justify-start items-center gap-2 text-sm text-muted-foreground">
                 <Timer className="w-4 h-4 text-gold" />
                 <span>Sorteio: <span className="text-foreground font-medium">{new Date(drawDate).toLocaleDateString('pt-BR')} às {new Date(drawDate).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span></span>
              </div>
            )}
          </div>

          {/* Right: Image (Hidden on mobile if desired, or kept) */}
          <div className="relative hidden lg:block animate-fade-in" style={{ animationDelay: '0.2s' }}>
             <div className="relative aspect-square rounded-2xl overflow-hidden border-4 border-gold/30 shadow-2xl shadow-gold/20 card-jackpot group">
              <img 
                src={imageUrl || rafflePrizesHero} 
                alt={prizeDescription}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-background/80 backdrop-blur-md p-4 rounded-xl border border-gold/30">
                  <p className="text-gold font-bold text-xs uppercase mb-1">Prêmio em destaque</p>
                  <p className="text-xl font-bold text-white">{prizeDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- EXTRA PRIZES GRID --- */}
        {(prizeReferral1st || prizeBuyer1st) && (
          <div className="animate-fade-in space-y-6" style={{ animationDelay: '0.3s' }}>
            <div className="text-center relative">
               <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gold/20"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-sm text-gold font-bold uppercase tracking-widest border border-gold/20 rounded-full py-1">
                    Vitrine de Prêmios Extras
                  </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Card 1: Top Referrer */}
              {prizeReferral1st && (
                <div
                  onClick={() => handlePrizeClick('Maior Indicador', prizeReferral1st, <Users className="w-8 h-8 text-blue-400" />)}
                  className="card-jackpot p-4 rounded-xl border border-blue-500/30 hover:border-blue-500/60 cursor-pointer transition-colors relative overflow-hidden group"
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-blue-100">Maior Indicador</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2 flex-grow">{prizeReferral1st}</p>

                    {referralThreshold && (
                      <div className="mt-auto pt-2 border-t border-blue-500/20 flex items-center gap-2 text-xs text-blue-300">
                        <Target className="w-3 h-3" />
                        <span>Meta: {referralThreshold} vendas</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Card 2: Top Buyer */}
              {prizeBuyer1st && (
                <div
                  onClick={() => handlePrizeClick('Maior Comprador', prizeBuyer1st, <Crown className="w-8 h-8 text-gold" />)}
                  className="card-jackpot p-4 rounded-xl border border-gold/30 hover:border-gold/60 cursor-pointer transition-colors relative overflow-hidden group"
                >
                   <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gold/20 rounded-lg text-gold group-hover:scale-110 transition-transform">
                        <Crown className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-yellow-100">Maior Comprador</h4>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{prizeBuyer1st}</p>
                  </div>
                </div>
              )}

              {/* Card 3: Referral Runners */}
              {prizeReferralRunners && (
                <div
                  onClick={() => handlePrizeClick('Top Indicadores (2º-5º)', prizeReferralRunners, <Medal className="w-8 h-8 text-slate-400" />)}
                  className="card-jackpot p-4 rounded-xl border border-slate-500/30 hover:border-slate-500/60 cursor-pointer transition-colors relative overflow-hidden group"
                >
                   <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-slate-500/20 rounded-lg text-slate-400 group-hover:scale-110 transition-transform">
                        <Medal className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-200">Top Indicadores</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">2º ao 5º Lugar</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prizeReferralRunners}</p>
                  </div>
                </div>
              )}

              {/* Card 4: Buyer Runners */}
              {prizeBuyerRunners && (
                <div
                  onClick={() => handlePrizeClick('Top Compradores (2º-5º)', prizeBuyerRunners, <Trophy className="w-8 h-8 text-bronze-400" />)}
                  className="card-jackpot p-4 rounded-xl border border-orange-500/30 hover:border-orange-500/60 cursor-pointer transition-colors relative overflow-hidden group"
                >
                   <div className="flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-500/20 rounded-lg text-orange-400 group-hover:scale-110 transition-transform">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-orange-100">Top Compradores</h4>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold">2º ao 5º Lugar</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{prizeBuyerRunners}</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      <Dialog open={!!selectedPrize} onOpenChange={() => setSelectedPrize(null)}>
        <DialogContent className="sm:max-w-md border-gold/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mb-4 animate-pulse-glow">
              {selectedPrize?.icon}
            </div>
            <DialogTitle className="text-center text-xl font-display text-gold">
              {selectedPrize?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="px-4 pb-4">
            <div className="p-4 rounded-lg bg-secondary/10 border border-border">
              <p className="text-center text-muted-foreground whitespace-pre-wrap">
                {selectedPrize?.details}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
