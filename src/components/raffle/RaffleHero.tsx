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
import { CountdownTimer } from './CountdownTimer';

interface RaffleHeroProps {
  title: string;
  description: string | null;
  prizeDescription: string;
  prizeDrawDetails?: string | null;

  // New Gamification Props
  enableReferral1st?: boolean;
  prizeReferral1st?: string | null;
  referralThreshold?: number | null;
  enableBuyer1st?: boolean;
  prizeBuyer1st?: string | null;
  enableReferralRunners?: boolean;
  prizeReferralRunners?: string | null;
  enableBuyerRunners?: boolean;
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
  enableReferral1st,
  prizeReferral1st,
  referralThreshold,
  enableBuyer1st,
  prizeBuyer1st,
  enableReferralRunners,
  prizeReferralRunners,
  enableBuyerRunners,
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

            {/* Urgency Progress Bar */}
            <div className="space-y-3">
              {/* Progress Bar with Dynamic Colors */}
              <div className="relative">
                <div className="h-4 bg-muted/50 rounded-full overflow-hidden border border-border/50">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${progressPercentage >= 80
                      ? 'bg-gradient-to-r from-red-600 via-red-500 to-orange-500'
                      : progressPercentage >= 50
                        ? 'bg-gradient-to-r from-yellow-600 via-yellow-500 to-gold'
                        : 'bg-gradient-to-r from-emerald-dark via-emerald to-emerald-light'
                      }`}
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </div>
                </div>
                {/* Percentage badge */}
                <div
                  className={`absolute -top-1 transform -translate-x-1/2 px-2 py-0.5 rounded-full text-xs font-bold ${progressPercentage >= 80
                    ? 'bg-red-500 text-white'
                    : progressPercentage >= 50
                      ? 'bg-gold text-black'
                      : 'bg-emerald text-white'
                    }`}
                  style={{ left: `${Math.min(Math.max(progressPercentage, 5), 95)}%` }}
                >
                  {progressPercentage.toFixed(0)}%
                </div>
              </div>

              {/* Urgency Message */}
              <div className={`text-center p-3 rounded-xl border ${progressPercentage >= 80
                ? 'bg-red-500/10 border-red-500/30 animate-pulse'
                : progressPercentage >= 50
                  ? 'bg-gold/10 border-gold/30'
                  : 'bg-emerald/10 border-emerald/30'
                }`}>
                <p className={`font-bold text-sm ${progressPercentage >= 80
                  ? 'text-red-400'
                  : progressPercentage >= 50
                    ? 'text-gold'
                    : 'text-emerald'
                  }`}>
                  {progressPercentage >= 80
                    ? `🚨 ÚLTIMOS NÚMEROS! Apenas ${availableNumbers.toLocaleString()} restantes!`
                    : progressPercentage >= 50
                      ? `🔥 Metade já foi! Restam ${availableNumbers.toLocaleString()} números`
                      : `🎯 Garanta seus números! ${availableNumbers.toLocaleString()} disponíveis`}
                </p>
              </div>
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
                <p className="text-xl font-display font-bold text-purple">{soldNumbers.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground uppercase">vendidos</p>
              </div>
            </div>

            <Button
              onClick={onParticipate}
              size="lg"
              className="btn-luck w-full text-lg py-8 text-primary-foreground font-bold uppercase tracking-wider shadow-xl shadow-emerald/20 hover:shadow-emerald/40 transition-all animate-pulse-glow"
            >
              <span className="mr-2 text-2xl">🎟️</span>
              Comprar Números Agora
            </Button>

            {drawDate && (
              <CountdownTimer targetDate={drawDate} />
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
        {(() => {
          const extraPrizes = [
            {
              id: 'referral_1st',
              enabled: enableReferral1st,
              text: prizeReferral1st,
              title: 'Maior Indicador',
              icon: <Users className="w-6 h-6" />,
              detailsIcon: <Users className="w-8 h-8 text-blue-400" />,
              borderColor: 'border-blue-500/30 hover:border-blue-500/60',
              bgColor: 'bg-blue-500/20',
              textColor: 'text-blue-400',
              titleColor: 'text-blue-100',
              subTitle: null,
              threshold: referralThreshold
            },
            {
              id: 'buyer_1st',
              enabled: enableBuyer1st,
              text: prizeBuyer1st,
              title: 'Maior Comprador',
              icon: <Crown className="w-6 h-6" />,
              detailsIcon: <Crown className="w-8 h-8 text-gold" />,
              borderColor: 'border-gold/30 hover:border-gold/60',
              bgColor: 'bg-gold/20',
              textColor: 'text-gold',
              titleColor: 'text-yellow-100',
              subTitle: null
            },
            {
              id: 'referral_runners',
              enabled: enableReferralRunners,
              text: prizeReferralRunners,
              title: 'Top Indicadores',
              icon: <Medal className="w-6 h-6" />,
              detailsIcon: <Medal className="w-8 h-8 text-slate-400" />,
              borderColor: 'border-slate-500/30 hover:border-slate-500/60',
              bgColor: 'bg-slate-500/20',
              textColor: 'text-slate-400',
              titleColor: 'text-slate-200',
              subTitle: '2º ao 5º Lugar'
            },
            {
              id: 'buyer_runners',
              enabled: enableBuyerRunners,
              text: prizeBuyerRunners,
              title: 'Top Compradores',
              icon: <Trophy className="w-6 h-6" />,
              detailsIcon: <Trophy className="w-8 h-8 text-orange-400" />,
              borderColor: 'border-orange-500/30 hover:border-orange-500/60',
              bgColor: 'bg-orange-500/20',
              textColor: 'text-orange-400',
              titleColor: 'text-orange-100',
              subTitle: '2º ao 5º Lugar'
            }
          ].filter(p => p.enabled && p.text);

          if (extraPrizes.length === 0) return null;

          return (
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
                {extraPrizes.map((prize) => (
                  <div
                    key={prize.id}
                    onClick={() => handlePrizeClick(prize.title + (prize.subTitle ? ` (${prize.subTitle})` : ''), prize.text, prize.detailsIcon)}
                    className={`card-jackpot p-4 rounded-xl border ${prize.borderColor} cursor-pointer transition-colors relative overflow-hidden group`}
                  >
                    <div className="flex flex-col h-full">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 ${prize.bgColor} rounded-lg ${prize.textColor} group-hover:scale-110 transition-transform`}>
                          {prize.icon}
                        </div>
                        <h4 className={`font-bold ${prize.titleColor}`}>{prize.title}</h4>
                      </div>
                      {prize.subTitle && (
                        <p className="text-[10px] text-muted-foreground mb-1 uppercase font-semibold">{prize.subTitle}</p>
                      )}
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-2 flex-grow">{prize.text}</p>

                      {prize.threshold && (
                        <div className="mt-auto pt-2 border-t border-blue-500/20 flex items-center gap-2 text-xs text-blue-300">
                          <Target className="w-3 h-3" />
                          <span>Meta: {prize.threshold} vendas</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
