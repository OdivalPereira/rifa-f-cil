import { formatCurrency } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Ticket, Gift, Timer } from 'lucide-react';

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pattern-luxury">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <Ticket className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Rifa Premium</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">
              <span className="text-gradient-gold">{title}</span>
            </h1>

            {/* Description */}
            {description && (
              <p className="text-lg text-muted-foreground max-w-xl">
                {description}
              </p>
            )}

            {/* Prize */}
            <div className="flex items-start gap-4 p-6 rounded-xl bg-card border border-border">
              <div className="p-3 rounded-lg bg-gold/10">
                <Gift className="w-6 h-6 text-gold" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prêmio</p>
                <p className="text-xl font-semibold text-foreground">{prizeDescription}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-gold">{formatCurrency(pricePerNumber)}</p>
                <p className="text-xs text-muted-foreground">por número</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{availableNumbers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">disponíveis</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <p className="text-2xl font-bold text-foreground">{totalNumbers.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">total</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso da venda</span>
                <span className="text-gold font-medium">{progressPercentage.toFixed(1)}%</span>
              </div>
              <div className="h-3 rounded-full bg-secondary overflow-hidden">
                <div 
                  className="h-full bg-gradient-gold rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>

            {/* Draw date */}
            {drawDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span>Sorteio: {new Date(drawDate).toLocaleDateString('pt-BR', { 
                  day: '2-digit', 
                  month: 'long', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
            )}

            {/* CTA Button */}
            <Button 
              onClick={onParticipate}
              size="lg"
              className="w-full sm:w-auto text-lg px-8 py-6 bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold-lg transition-all duration-300 hover:shadow-gold"
            >
              <Ticket className="w-5 h-5 mr-2" />
              Participar da Rifa
            </Button>
          </div>

          {/* Right: Image */}
          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="relative aspect-square rounded-2xl overflow-hidden shadow-gold-lg">
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={prizeDescription}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/5 flex items-center justify-center">
                  <Gift className="w-24 h-24 text-gold/50" />
                </div>
              )}
              {/* Overlay decoration */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 px-6 py-3 rounded-xl bg-card border border-gold/30 shadow-gold glow-gold">
              <p className="text-sm text-muted-foreground">A partir de</p>
              <p className="text-2xl font-bold text-gold">{formatCurrency(pricePerNumber)}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
