import { SlotMachineFrame } from "@/components/SlotMachineFrame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ArrowLeft, Crown, Ticket, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActiveRaffle, useReferralRanking, useTopBuyersRanking } from "@/hooks/useRaffle";

function RankingRow({
  position,
  name,
  value,
  label,
}: {
  position: number;
  name: string;
  value: number;
  label: string;
}) {
  const getMedalColor = (pos: number) => {
    switch (pos) {
      case 1: return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]";
      case 2: return "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]";
      case 3: return "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]";
      default: return "text-muted-foreground";
    }
  };

  const getRowStyle = (pos: number) => {
    if (pos === 1) return "bg-yellow-500/10 border-yellow-500/30";
    if (pos === 2) return "bg-slate-300/10 border-slate-300/30";
    if (pos === 3) return "bg-amber-600/10 border-amber-600/30";
    return "bg-card/50 border-border/50";
  };

  return (
    <div className={cn(
      "flex items-center p-4 rounded-xl border mb-3 transition-all hover:scale-[1.01]",
      getRowStyle(position)
    )}>
      <div className="w-12 flex justify-center font-bold text-xl">
        {position <= 3 ? (
          <Medal className={cn("w-8 h-8", getMedalColor(position))} />
        ) : (
          <span className="text-muted-foreground font-mono">#{position}</span>
        )}
      </div>

      <div className="flex-1 px-4">
        <p className={cn(
          "font-display font-medium text-lg truncate",
          position === 1 ? "text-yellow-400" : "text-foreground"
        )}>
          {name}
        </p>
        {position === 1 && (
          <p className="text-xs text-yellow-500/80 animate-pulse font-semibold">
            👑 Líder do Ranking
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="font-bold text-lg text-gold">{value}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

function EmptyRanking({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
      <p className="text-muted-foreground">{message}</p>
      <p className="text-sm text-muted-foreground/70 mt-2">
        Seja o primeiro a aparecer no ranking!
      </p>
    </div>
  );
}

function LoadingRanking() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-gold" />
    </div>
  );
}

export default function Rankings() {
  const { data: raffle, isLoading: raffleLoading } = useActiveRaffle();
  const { data: referralRanking, isLoading: referralLoading } = useReferralRanking(raffle?.id);
  const { data: buyersRanking, isLoading: buyersLoading } = useTopBuyersRanking(raffle?.id);

  // Get prizes from raffle if available (with type assertion for new fields)
  const r = raffle as typeof raffle & {
    prize_referral_1st?: string | null;
    prize_buyer_1st?: string | null;
  } | undefined;

  const referralPrize = r?.prize_referral_1st || "Prêmio surpresa para o Top Indicador! 🎁";
  const buyerPrize = r?.prize_buyer_1st || "Prêmio surpresa para o Maior Comprador! 🎁";

  // Mask phone number for privacy (show only last 4 digits)
  const maskPhone = (phone: string) => {
    if (!phone) return "Participante";
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 4) return "****";
    return `****${clean.slice(-4)}`;
  };

  return (
    <SlotMachineFrame>
      <div className="container max-w-2xl mx-auto px-4 py-8 pb-20">

        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gold/10 border border-gold/30 mb-4 animate-bounce-slow">
            <Trophy className="w-8 h-8 text-gold drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gradient-gold mb-2 drop-shadow-sm">
            Hall da Fama
          </h1>
          <p className="text-muted-foreground">
            Os maiores destaques da nossa comunidade
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="referrals" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-black/40 border border-gold/20 p-1 mb-8 rounded-xl backdrop-blur-md">
            <TabsTrigger
              value="referrals"
              className="h-full rounded-lg data-[state=active]:bg-gold data-[state=active]:text-black font-bold text-base transition-all"
            >
              <Users className="w-4 h-4 mr-2" />
              Top Indicadores
            </TabsTrigger>
            <TabsTrigger
              value="buyers"
              className="h-full rounded-lg data-[state=active]:bg-gold data-[state=active]:text-black font-bold text-base transition-all"
            >
              <Ticket className="w-4 h-4 mr-2" />
              Maiores Compradores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="referrals" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-black/20 border-gold/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6 text-yellow-400/80 bg-yellow-400/5 p-3 rounded-lg border border-yellow-400/10">
                  <Crown className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Prêmio para o 1º Lugar: <span className="text-white font-bold">{referralPrize}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  {raffleLoading || referralLoading ? (
                    <LoadingRanking />
                  ) : referralRanking && referralRanking.length > 0 ? (
                    referralRanking.map((user, index) => (
                      <RankingRow
                        key={user.referrer_id}
                        position={index + 1}
                        name={maskPhone(user.referrer_phone)}
                        value={user.tickets_sold}
                        label="Indicações"
                      />
                    ))
                  ) : (
                    <EmptyRanking message="Ainda não há indicadores no ranking" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buyers" className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-black/20 border-gold/10 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-6 text-emerald-400/80 bg-emerald-400/5 p-3 rounded-lg border border-emerald-400/10">
                  <Ticket className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Prêmio para o 1º Lugar: <span className="text-white font-bold">{buyerPrize}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  {raffleLoading || buyersLoading ? (
                    <LoadingRanking />
                  ) : buyersRanking && buyersRanking.length > 0 ? (
                    buyersRanking.map((user, index) => (
                      <RankingRow
                        key={`${user.buyer_phone}-${index}`}
                        position={index + 1}
                        name={user.buyer_name || maskPhone(user.buyer_phone)}
                        value={user.tickets_bought}
                        label="Números"
                      />
                    ))
                  ) : (
                    <EmptyRanking message="Ainda não há compradores no ranking" />
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-8 flex justify-center">
          <Link to="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </div>

      </div>
    </SlotMachineFrame>
  );
}