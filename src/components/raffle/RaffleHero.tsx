import { formatCurrency } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Ticket, Gift, Timer, Sparkles, Star, Coins, Trophy, Zap } from 'lucide-react';

interface RaffleHeroProps {
  title: string;
  description: string | null;
  prizeDescription: string;
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
  imageUrl,
  pricePerNumber,
  totalNumbers,
  soldNumbers,
  drawDate,
  onParticipate,
}: RaffleHeroProps) {
  const progressPercentage = (soldNumbers / totalNumbers) * 100;
  const availableNumbers = totalNumbers - soldNumbers;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-8">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: Content */}
          <div className="space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 border border-emerald/30 glow-emerald">
              <span className="text-emerald animate-sparkle">🍀</span>
              <span className="text-sm font-semibold text-emerald">Rifa da Sorte</span>
              <Sparkles className="w-4 h-4 text-gold animate-sparkle" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              <span className="text-gradient-luck">{title}</span>
            </h1>

            {/* Description */}
            {description && (
              <p className="text-lg text-muted-foreground max-w-xl">
                {description}
              </p>
            )}

            {/* Prize Card */}
            <div className="card-jackpot p-6 rounded-xl border border-gold/30 relative overflow-hidden">
              <div className="absolute top-2 right-2 text-gold/20">
                <Trophy className="w-12 h-12" />
              </div>
              <div className="flex items-start gap-4 relative z-10">
                <div className="p-3 rounded-lg bg-gradient-gold animate-pulse-glow shrink-0">
                  <Gift className="w-6 h-6 text-purple-dark" />
                </div>
                <div>
                  <p className="text-sm text-gold font-medium mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    GRANDE PRÊMIO
                  </p>
                  <p className="text-xl font-bold text-foreground">{prizeDescription}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card-casino text-center p-4 rounded-xl border border-emerald/20">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-emerald/10 flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-emerald" />
                </div>
                <p className="text-2xl font-display font-bold text-emerald">{formatCurrency(pricePerNumber)}</p>
                <p className="text-xs text-muted-foreground">por número</p>
              </div>
              <div className="card-casino text-center p-4 rounded-xl border border-gold/20">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-gold/10 flex items-center justify-center">
                  <Star className="w-5 h-5 text-gold" />
                </div>
                <p className="text-2xl font-display font-bold text-gold">{availableNumbers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">disponíveis</p>
              </div>
              <div className="card-casino text-center p-4 rounded-xl border border-purple/20">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-purple/10 flex items-center justify-center">
                  <Coins className="w-5 h-5 text-purple" />
                </div>
                <p className="text-2xl font-display font-bold text-purple">{totalNumbers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="card-casino p-4 rounded-xl border border-border space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-emerald" />
                  Números vendidos
                </span>
                <span className="text-emerald font-bold">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="progress-jackpot h-4">
                <div 
                  className="progress-jackpot-bar"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                <span className="text-gold font-semibold">{soldNumbers.toLocaleString()}</span> de {totalNumbers.toLocaleString()} vendidos
              </p>
            </div>

            {/* Draw date */}
            {drawDate && (
              <div className="flex items-center gap-2 text-muted-foreground bg-purple/10 border border-purple/20 px-4 py-3 rounded-xl w-fit">
                <Timer className="w-5 h-5 text-purple" />
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
              className="btn-luck w-full sm:w-auto text-lg px-10 py-7 text-primary-foreground font-bold uppercase tracking-wider"
            >
              <span className="mr-2 text-xl">🍀</span>
              Participar Agora
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>

          {/* Right: Image */}
          <div className="relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gold/30 shadow-gold-lg card-jackpot">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={prizeDescription}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-dark via-background to-emerald-dark flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-gold/10 flex items-center justify-center animate-pulse-glow">
                      <Gift className="w-12 h-12 text-gold" />
                    </div>
                    <p className="text-gold/70 font-medium">Prêmio Especial</p>
                  </div>
                </div>
              )}
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
    </section>
  );
}