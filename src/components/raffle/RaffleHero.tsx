import { formatCurrency } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Ticket, Gift, Timer, Sparkles, Star, Coins, Trophy, Zap, Medal, Crown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import rafflePrizesHero from '@/assets/raffle-prizes-hero.jpg';

interface RaffleHeroProps {
  title: string;
  description: string | null;
  prizeDescription: string;
  prizeDrawDetails?: string | null;
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
  prizeTopBuyer,
  prizeTopBuyerDetails,
  prizeSecondTopBuyer,
  prizeSecondTopBuyerDetails,
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
    setSelectedPrize({
      title,
      details: details || 'Sem detalhes adicionais disponíveis.',
      icon,
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-6 px-4">
      {/* Background decorations - hidden on mobile for cleaner look */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        
        {/* Floating decorations */}
        <div className="absolute top-20 left-10 text-gold/20 animate-float">
          <Coins className="w-12 h-12" />
        </div>
        <div className="absolute top-40 right-20 text-emerald/20 animate-float" style={{ animationDelay: '1s' }}>
          <Star className="w-8 h-8" />
        </div>
        <div className="absolute bottom-32 left-20 text-purple/20 animate-float" style={{ animationDelay: '2s' }}>
          <Sparkles className="w-10 h-10" />
        </div>
        <div className="absolute bottom-20 right-32 text-gold/15 animate-float" style={{ animationDelay: '0.5s' }}>
          <Trophy className="w-8 h-8" />
        </div>
      </div>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
          {/* Left: Content */}
          <div className="space-y-4 sm:space-y-6 animate-fade-in w-full text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-emerald/10 border border-emerald/30 glow-emerald mx-auto lg:mx-0">
              <span className="text-emerald animate-sparkle">🍀</span>
              <span className="text-xs sm:text-sm font-semibold text-emerald">Rifa da Sorte</span>
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-gold animate-sparkle" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              <span className="text-gradient-luck">{title}</span>
            </h1>

            {/* Description */}
            {description && (
              <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                {description}
              </p>
            )}

            {/* Prize Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.2fr_1fr] gap-3 items-end">
              {/* 1º Prêmio - Sorteio Principal */}
              <div
                onClick={() => handlePrizeClick(prizeDescription, prizeDrawDetails || null, <Gift className="w-8 h-8 text-purple-dark" />)}
                className="card-jackpot p-3 rounded-xl border border-gold/30 relative overflow-hidden cursor-pointer hover:border-gold/60 transition-colors group"
              >
                <div className="flex flex-col items-center text-center gap-2 relative z-10">
                  <div className="p-2 rounded-lg bg-gradient-gold animate-pulse-glow shrink-0 group-hover:scale-110 transition-transform">
                    <Gift className="w-5 h-5 text-purple-dark" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-gold font-bold mb-1">
                      1º Prêmio
                    </p>
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{prizeDescription}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 underline">Ver detalhes</p>
                  </div>
                </div>
              </div>

              {/* 2º Prêmio - Top 10 Compradores - DESTAQUE */}
              <div
                onClick={() => handlePrizeClick(prizeTopBuyer || 'Top 10 Compradores', prizeTopBuyerDetails || null, <Crown className="w-8 h-8 text-gold" />)}
                className={`card-jackpot p-4 sm:p-5 pt-6 sm:pt-7 rounded-xl border-2 border-emerald/50 relative cursor-pointer hover:border-emerald transition-all group shadow-lg shadow-emerald/20 ${!prizeTopBuyer ? 'opacity-50 pointer-events-none' : ''}`}
              >
                {/* Destaque badge */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-emerald rounded-full text-[9px] font-bold text-primary-foreground uppercase tracking-wider z-20">
                  ✨ Destaque
                </div>
                <div className="flex flex-col items-center text-center gap-2 relative z-10">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-emerald to-emerald-light animate-pulse-glow shrink-0 group-hover:scale-110 transition-transform">
                    <Crown className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] uppercase tracking-wider text-emerald font-bold mb-1">
                      2º Prêmio • Top 10
                    </p>
                    <p className="text-base font-bold text-foreground line-clamp-2 leading-tight">{prizeTopBuyer || 'Em breve'}</p>
                    {prizeTopBuyer && <p className="text-[10px] text-muted-foreground mt-1 underline">Ver detalhes</p>}
                  </div>
                </div>
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald/10 to-transparent pointer-events-none rounded-xl" />
              </div>

              {/* 3º Prêmio - Top 30 Compradores */}
              <div
                onClick={() => handlePrizeClick(prizeSecondTopBuyer || 'Top 30 Compradores', prizeSecondTopBuyerDetails || null, <Medal className="w-8 h-8 text-purple" />)}
                className={`card-jackpot p-3 rounded-xl border border-purple/30 relative overflow-hidden cursor-pointer hover:border-purple/60 transition-colors group ${!prizeSecondTopBuyer ? 'opacity-50 pointer-events-none' : ''}`}
              >
                <div className="flex flex-col items-center text-center gap-2 relative z-10">
                  <div className="p-2 rounded-lg bg-purple/20 shrink-0 group-hover:scale-110 transition-transform">
                    <Medal className="w-5 h-5 text-purple" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-purple font-bold mb-1">
                      3º Prêmio • Top 30
                    </p>
                    <p className="text-sm font-bold text-foreground line-clamp-2 leading-tight">{prizeSecondTopBuyer || 'Em breve'}</p>
                    {prizeSecondTopBuyer && <p className="text-[10px] text-muted-foreground mt-1 underline">Ver detalhes</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="card-casino text-center p-2 sm:p-4 rounded-xl border border-emerald/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-lg bg-emerald/10 flex items-center justify-center">
                  <Ticket className="w-4 h-4 sm:w-5 sm:h-5 text-emerald" />
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-emerald">{formatCurrency(pricePerNumber)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">por número</p>
              </div>
              <div className="card-casino text-center p-2 sm:p-4 rounded-xl border border-gold/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-gold">{availableNumbers.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">disponíveis</p>
              </div>
              <div className="card-casino text-center p-2 sm:p-4 rounded-xl border border-purple/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-1 sm:mb-2 rounded-lg bg-purple/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-purple" />
                </div>
                <p className="text-lg sm:text-2xl font-display font-bold text-purple">{totalNumbers.toLocaleString()}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">total</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="card-casino p-3 sm:p-4 rounded-xl border border-border space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Ticket className="w-3 h-3 sm:w-4 sm:h-4 text-emerald" />
                  Números vendidos
                </span>
                <span className="text-emerald font-bold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="progress-jackpot h-3 sm:h-4">
                <div 
                  className="progress-jackpot-bar"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                <span className="text-gold font-semibold">{soldNumbers.toLocaleString()}</span> de {totalNumbers.toLocaleString()} vendidos
              </p>
            </div>

            {/* Draw date */}
            {drawDate && (
              <div className="flex items-center gap-2 text-muted-foreground bg-purple/10 border border-purple/20 px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-base">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-purple shrink-0" />
                <span>Sorteio: <span className="text-foreground font-medium">{new Date(drawDate).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span></span>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              onClick={onParticipate}
              size="lg"
              className="btn-luck w-full text-base sm:text-lg px-6 sm:px-10 py-5 sm:py-7 text-primary-foreground font-bold uppercase tracking-wider"
            >
              <span className="mr-2 text-lg sm:text-xl">🍀</span>
              Participar Agora
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
            </Button>
          </div>

          {/* Right: Image - Hidden on mobile since there's no image */}
          <div className="relative animate-fade-in hidden lg:block" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gold/30 shadow-gold-lg card-jackpot">
              <img 
                src={imageUrl || rafflePrizesHero} 
                alt={prizeDescription}
                className="w-full h-full object-cover"
              />
              {/* Overlay decoration */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
              
              {/* Corner sparkles */}
              <div className="absolute top-4 right-4 text-gold animate-sparkle">
                <Star className="w-6 h-6" />
              </div>
              <div className="absolute top-4 left-4 text-emerald animate-sparkle" style={{ animationDelay: '0.5s' }}>
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            
            {/* Floating price badge */}
            <div className="absolute -bottom-4 -right-4 px-6 py-4 rounded-xl card-jackpot border-2 border-gold/40 shadow-gold-lg">
              <p className="text-xs text-gold font-medium">A partir de</p>
              <p className="text-3xl font-display font-bold text-gradient-gold">{formatCurrency(pricePerNumber)}</p>
            </div>
            
            {/* Luck badge */}
            <div className="absolute -top-4 -left-4 px-4 py-2 rounded-lg bg-emerald border border-emerald-light glow-emerald">
              <span className="text-primary-foreground font-bold flex items-center gap-1">
                🍀 Boa Sorte!
              </span>
            </div>
          </div>
        </div>
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
