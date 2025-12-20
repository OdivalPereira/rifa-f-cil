import { useState } from 'react';
import { useAllRaffles, useDrawWinner, useAdminStats } from '@/hooks/useAdmin';
import { useSoldNumbers } from '@/hooks/useRaffle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatRaffleNumber } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Trophy, 
  Ticket, 
  AlertTriangle,
  PartyPopper,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminDraw() {
  const { toast } = useToast();
  const { data: raffles, isLoading } = useAllRaffles();
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<string | null>(null);

  const selectedRaffle = raffles?.find(r => r.id === selectedRaffleId);
  const { data: soldNumbers } = useSoldNumbers(selectedRaffleId);
  const { data: stats } = useAdminStats(selectedRaffleId);
  const drawWinner = useDrawWinner();

  const confirmedNumbers = soldNumbers?.filter(n => n.confirmed_at).map(n => n.number) || [];

  const handleDraw = async () => {
    if (!selectedRaffleId || confirmedNumbers.length === 0) return;

    setIsAnimating(true);
    setDisplayNumber(null);

    // Animate through random numbers
    const animationDuration = 5000;
    const interval = 50;
    let elapsed = 0;

    const animation = setInterval(() => {
      elapsed += interval;
      const randomIndex = Math.floor(Math.random() * confirmedNumbers.length);
      setDisplayNumber(formatRaffleNumber(confirmedNumbers[randomIndex], 5));

      if (elapsed >= animationDuration) {
        clearInterval(animation);
        // Actually perform the draw
        performDraw();
      }
    }, interval);
  };

  const performDraw = async () => {
    try {
      const result = await drawWinner.mutateAsync(selectedRaffleId);
      setDisplayNumber(formatRaffleNumber(result.winner_number!, 5));
      setIsAnimating(false);

      toast({
        title: '🎉 Sorteio realizado!',
        description: `O número ${formatRaffleNumber(result.winner_number!, 5)} foi sorteado! Ganhador: ${result.winner_name}`,
      });
    } catch (error: any) {
      setIsAnimating(false);
      setDisplayNumber(null);
      toast({
        title: 'Erro no sorteio',
        description: error.message || 'Não foi possível realizar o sorteio.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  const activeRaffles = raffles?.filter(r => r.status === 'active' || r.status === 'completed') || [];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold">Sorteio</h1>
        <p className="text-muted-foreground">Realize o sorteio da rifa</p>
      </div>

      {/* Raffle selector */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle>Selecione a Rifa</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedRaffleId} onValueChange={setSelectedRaffleId}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha uma rifa..." />
            </SelectTrigger>
            <SelectContent>
              {activeRaffles.map((raffle) => (
                <SelectItem key={raffle.id} value={raffle.id}>
                  {raffle.title} ({raffle.status === 'completed' ? 'Concluída' : 'Ativa'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedRaffle && (
        <>
          {/* Raffle info */}
          <Card className="border-gold/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Números vendidos</p>
                  <p className="text-2xl font-bold text-gold">{stats?.totalSold || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Participantes</p>
                  <p className="text-2xl font-bold">{confirmedNumbers.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Already drawn */}
          {selectedRaffle.status === 'completed' && selectedRaffle.winner_number && (
            <Card className="border-success/30 bg-success/5">
              <CardContent className="p-8 text-center space-y-4">
                <PartyPopper className="w-16 h-16 text-success mx-auto" />
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Número sorteado</p>
                  <p className="text-5xl font-bold font-mono text-success">
                    {formatRaffleNumber(selectedRaffle.winner_number, 5)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ganhador</p>
                  <p className="text-xl font-semibold">{selectedRaffle.winner_name}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Draw interface */}
          {selectedRaffle.status === 'active' && (
            <>
              {confirmedNumbers.length === 0 ? (
                <Card className="border-warning/30 bg-warning/5">
                  <CardContent className="p-8 text-center space-y-4">
                    <AlertTriangle className="w-12 h-12 text-warning mx-auto" />
                    <div>
                      <p className="font-semibold">Nenhum número confirmado</p>
                      <p className="text-sm text-muted-foreground">
                        Aprove os pagamentos pendentes antes de realizar o sorteio.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-gold/30 overflow-hidden">
                  <div className="h-2 bg-gradient-gold" />
                  <CardContent className="p-8 text-center space-y-6">
                    {/* Display area */}
                    <div 
                      className={cn(
                        "py-12 rounded-xl transition-all duration-300",
                        isAnimating 
                          ? "bg-gold/10 animate-pulse" 
                          : displayNumber 
                            ? "bg-success/10" 
                            : "bg-secondary/50"
                      )}
                    >
                      {displayNumber ? (
                        <div className="space-y-2">
                          <Sparkles className={cn(
                            "w-8 h-8 mx-auto",
                            isAnimating ? "text-gold animate-spin" : "text-success"
                          )} />
                          <p className={cn(
                            "text-6xl md:text-7xl font-bold font-mono",
                            isAnimating ? "text-gold" : "text-success"
                          )}>
                            {displayNumber}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Trophy className="w-12 h-12 text-gold/50 mx-auto" />
                          <p className="text-muted-foreground">
                            Clique no botão para sortear
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Draw button */}
                    <Button
                      onClick={handleDraw}
                      disabled={isAnimating || confirmedNumbers.length === 0}
                      size="lg"
                      className="w-full py-6 text-lg bg-gradient-gold text-primary-foreground hover:opacity-90 shadow-gold-lg"
                    >
                      {isAnimating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Sorteando...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-5 h-5 mr-2" />
                          Realizar Sorteio
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground">
                      O sorteio é definitivo e não pode ser desfeito
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
