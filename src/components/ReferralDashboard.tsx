import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import { Copy, Sparkles, Lock, Trophy } from 'lucide-react';

export default function ReferralDashboard() {
  const [isUnlocked, setIsUnlocked] = useState(false);

  const referralLink = "rifafacil.com/?ref=LUCAS2024";
  const requiredSales = 15;
  const currentSales = isUnlocked ? 12 : 12; // Just for display consistency

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "Agora é só compartilhar e ganhar.",
        className: "bg-emerald-950 border-emerald-500 text-white",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Tente selecionar e copiar manualmente.",
        variant: "destructive",
      });
    }
  };

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
              <span className="text-gold font-medium">12 / 15 vendas</span>
            </div>

            <div className="relative">
              <Progress value={80} className="h-4 bg-muted/50 border border-border/50" />
              <div className="absolute top-0 right-0 -mt-8">
                <span className="text-xs bg-gold/10 text-gold px-2 py-1 rounded-full border border-gold/20 animate-pulse">
                  Faltam 3 vendas!
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Seu Link da Sorte 🍀 está bloqueado. Continue indicando!
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUnlocked(true)}
                className="border-gold/30 hover:bg-gold/10 hover:text-gold w-full sm:w-auto"
              >
                Simular Desbloqueio
              </Button>
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
                Você já indicou <span className="text-gold font-bold">12 vendas</span>!
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={referralLink}
                  className="bg-muted/50 border-gold/30 text-gold font-mono pr-10 h-11"
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
          </div>
        )}
      </div>
    </div>
  );
}
