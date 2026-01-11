import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowRight, HelpCircle, Sparkles, Users, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { useActiveRaffle } from '@/hooks/useRaffle';

interface ReferralPromoProps {
  showShareButton?: boolean;
  referralCode?: string;
}

export const ReferralPromo = memo(({ showShareButton = true, referralCode }: ReferralPromoProps) => {
  const { data: raffle } = useActiveRaffle();

  const prizeDescription = raffle?.prize_description || 'prêmios incríveis';
  const raffleName = raffle?.title || 'Rifa da Sorte';

  return (
    <section className="container mx-auto px-4 my-8 sm:my-12">
      <div className="card-jackpot relative overflow-hidden p-6 sm:p-8 text-center border-gold/30">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/40 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 flex flex-col items-center gap-4 sm:gap-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center shadow-gold-lg animate-bounce-soft">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-black fill-current" />
            </div>
            <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-emerald animate-sparkle" />
            <Sparkles className="absolute -bottom-1 -left-2 w-4 h-4 text-emerald animate-sparkle" style={{ animationDelay: '0.5s' }} />
          </div>

          {/* Text Content */}
          <div className="space-y-2 sm:space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gradient-gold leading-tight">
              🏆 Desafio do Indicador: Ganhe Prêmios Extras!
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground/90 leading-relaxed">
              Além do sorteio principal, <span className="text-emerald font-bold">quem mais indicar amigos ganha prêmios exclusivos!</span> Compartilhe seu link e suba no ranking.
            </p>
          </div>

          {/* Stats badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald/10 border border-emerald/30">
              <Users className="w-4 h-4 text-emerald" />
              <span className="text-sm font-medium text-emerald">Indique Amigos</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/30">
              <Gift className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Ganhe Prêmios</span>
            </div>
          </div>

          {/* WhatsApp Share Section - Main CTA */}
          {showShareButton && (
            <div className="w-full max-w-md mt-2">
              <WhatsAppShareButton
                referralCode={referralCode}
                prizeDescription={prizeDescription}
                raffleName={raffleName}
              />
            </div>
          )}

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-2">
            <Link to="/rankings" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-gold/30 hover:border-gold hover:bg-gold/10 text-gold font-bold text-base transition-all"
              >
                Ver Ranking em Tempo Real
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>

            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-gold flex items-center gap-2 transition-colors py-2"
              onClick={(e) => e.preventDefault()}
            >
              <HelpCircle className="w-4 h-4" />
              Como funciona?
            </button>
          </div>
        </div>
      </div>
    </section>
  );
});

ReferralPromo.displayName = 'ReferralPromo';
