import { SlotMachineFrame } from "@/components/SlotMachineFrame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, ArrowLeft, Crown, Ticket, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock Data
const topReferrers = [
  { id: 1, name: "João Silva", sales: 45, reward: "Viagem" },
  { id: 2, name: "Maria Oliveira", sales: 38, reward: "Iphone 15" },
  { id: 3, name: "Carlos Santos", sales: 32, reward: "R$ 1.000" },
  { id: 4, name: "Ana Pereira", sales: 28 },
  { id: 5, name: "Pedro Costa", sales: 25 },
  { id: 6, name: "Lucas Ferreira", sales: 22 },
  { id: 7, name: "Juliana Lima", sales: 19 },
  { id: 8, name: "Marcos Souza", sales: 15 },
  { id: 9, name: "Fernanda Alves", sales: 12 },
  { id: 10, name: "Rafael Dias", sales: 10 },
];

const topBuyers = [
  { id: 1, name: "Roberto M.", tickets: 150, reward: "Projetor 4K" },
  { id: 2, name: "Patricia K.", tickets: 120, reward: "Alexa Echo" },
  { id: 3, name: "Gustavo H.", tickets: 95, reward: "JBL Flip" },
  { id: 4, name: "Camila R.", tickets: 80 },
  { id: 5, name: "Felipe N.", tickets: 75 },
  { id: 6, name: "Bruno T.", tickets: 60 },
  { id: 7, name: "Vanessa P.", tickets: 55 },
  { id: 8, name: "Rodrigo L.", tickets: 45 },
  { id: 9, name: "Amanda B.", tickets: 40 },
  { id: 10, name: "Thiago S.", tickets: 35 },
];

function RankingRow({
  position,
  name,
  value,
  label,
  isTop3 = false
}: {
  position: number;
  name: string;
  value: number;
  label: string;
  isTop3?: boolean;
}) {
  const getMedalColor = (pos: number) => {
    switch (pos) {
      case 1: return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"; // Gold
      case 2: return "text-slate-300 drop-shadow-[0_0_8px_rgba(203,213,225,0.5)]"; // Silver
      case 3: return "text-amber-600 drop-shadow-[0_0_8px_rgba(217,119,6,0.5)]"; // Bronze
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

export default function Rankings() {
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
                    Prêmio para o 1º Lugar: <span className="text-white font-bold">Viagem com Acompanhante! ✈️</span>
                  </p>
                </div>

                <div className="space-y-1">
                  {topReferrers.map((user) => (
                    <RankingRow
                      key={user.id}
                      position={user.id}
                      name={user.name}
                      value={user.sales}
                      label="Indicações"
                    />
                  ))}
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
                    Prêmio para o 1º Lugar: <span className="text-white font-bold">Projetor 4K Ultra HD! 🎬</span>
                  </p>
                </div>

                <div className="space-y-1">
                  {topBuyers.map((user) => (
                    <RankingRow
                      key={user.id}
                      position={user.id}
                      name={user.name}
                      value={user.tickets}
                      label="Números"
                    />
                  ))}
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
