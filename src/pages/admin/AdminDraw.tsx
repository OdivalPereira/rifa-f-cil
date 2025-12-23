import { useState } from 'react';
import { useAllRaffles, useDrawWinner, useAdminStats, useTopBuyers, useDrawTopBuyerWinner } from '@/hooks/useAdmin';
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
  Sparkles,
  Crown,
  Medal,
  Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DrawType = 'main' | 'top10' | 'top30';

export default function AdminDraw() {
  const { toast } = useToast();
  const { data: raffles, isLoading } = useAllRaffles();
  const [selectedRaffleId, setSelectedRaffleId] = useState<string>('');
  const [activeDrawType, setActiveDrawType] = useState<DrawType>('main');
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const selectedRaffle = raffles?.find(r => r.id === selectedRaffleId);
  const { data: soldNumbers } = useSoldNumbers(selectedRaffleId);
  const { data: stats } = useAdminStats(selectedRaffleId);
  const { data: topBuyers } = useTopBuyers(selectedRaffleId, 30);
  const drawWinner = useDrawWinner();
  const drawTopBuyerWinner = useDrawTopBuyerWinner();

  const confirmedNumbers = soldNumbers?.filter(n => n.confirmed_at).map(n => n.number) || [];
  const top10Buyers = topBuyers?.slice(0, 10) || [];
  const top30Buyers = topBuyers?.slice(0, 30) || [];

  const handleDraw = async (drawType: DrawType) => {
    if (!selectedRaffleId) return;

    setActiveDrawType(drawType);
    setIsAnimating(true);
    setDisplayNumber(null);
    setDisplayName(null);

    // Animate
    const animationDuration = 5000;
    const interval = 50;
    let elapsed = 0;

    const getRandomDisplay = () => {
      if (drawType === 'main') {
        const randomIndex = Math.floor(Math.random() * confirmedNumbers.length);
        return { number: formatRaffleNumber(confirmedNumbers[randomIndex], 5), name: null };
      } else {
        const buyers = drawType === 'top10' ? top10Buyers : top30Buyers;
        const randomIndex = Math.floor(Math.random() * buyers.length);
        return { number: null, name: buyers[randomIndex]?.name || 'Carregando...' };
      }
    };

    const animation = setInterval(() => {
      elapsed += interval;
      const display = getRandomDisplay();
      setDisplayNumber(display.number);
      setDisplayName(display.name);

      if (elapsed >= animationDuration) {
        clearInterval(animation);
        performDraw(drawType);
      }
    }, interval);
  };

  const performDraw = async (drawType: DrawType) => {
    try {
      if (drawType === 'main') {
        const result = await drawWinner.mutateAsync(selectedRaffleId);
        setDisplayNumber(formatRaffleNumber(result.winner_number!, 5));
        setDisplayName(result.winner_name);
        toast({
          title: '🎉 Sorteio do 1º Prêmio realizado!',
          description: `Número ${formatRaffleNumber(result.winner_number!, 5)} - ${result.winner_name}`,
        });
      } else if (drawType === 'top10') {
        const result = await drawTopBuyerWinner.mutateAsync({
          raffleId: selectedRaffleId,
          topN: 10,
          prizeType: 'top_buyer',
        });
        setDisplayNumber(null);
        setDisplayName(`${result.winner.name} (${result.winner.total} números)`);
        toast({
          title: '🎉 Sorteio do 2º Prêmio realizado!',
          description: `Ganhador: ${result.winner.name} com ${result.winner.total} números comprados`,
        });
      } else if (drawType === 'top30') {
        const result = await drawTopBuyerWinner.mutateAsync({
          raffleId: selectedRaffleId,
          topN: 30,
          prizeType: 'second_top_buyer',
        });
        setDisplayNumber(null);
        setDisplayName(`${result.winner.name} (${result.winner.total} números)`);
        toast({
          title: '🎉 Sorteio do 3º Prêmio realizado!',
          description: `Ganhador: ${result.winner.name} com ${result.winner.total} números comprados`,
        });
      }
      setIsAnimating(false);
    } catch (error: any) {
      setIsAnimating(false);
      setDisplayNumber(null);
      setDisplayName(null);
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

  const hasMainWinner = selectedRaffle?.winner_number != null;
  const hasTopBuyerWinner = selectedRaffle?.winner_top_buyer_name != null;
  const hasSecondTopBuyerWinner = selectedRaffle?.winner_second_top_buyer_name != null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold">Sorteio</h1>
        <p className="text-muted-foreground">Realize os sorteios da rifa</p>
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
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Números vendidos</p>
                  <p className="text-2xl font-bold text-gold">{stats?.totalSold || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Números confirmados</p>
                  <p className="text-2xl font-bold text-emerald">{confirmedNumbers.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Compradores únicos</p>
                  <p className="text-2xl font-bold text-purple">{topBuyers?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prize cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1º Prêmio - Sorteio Principal */}
            <Card className={cn(
              "border-gold/30 relative overflow-hidden",
              hasMainWinner && "bg-success/5 border-success/30"
            )}>
              <div className="h-1 bg-gradient-gold" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-gold" />
                  <CardTitle className="text-lg">1º Prêmio</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {selectedRaffle.prize_description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasMainWinner ? (
                  <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                    <PartyPopper className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Ganhador</p>
                    <p className="font-bold text-success">{selectedRaffle.winner_name}</p>
                    <p className="text-2xl font-mono font-bold text-success mt-1">
                      {formatRaffleNumber(selectedRaffle.winner_number!, 5)}
                    </p>
                  </div>
                ) : (
                  <>
                    {isAnimating && activeDrawType === 'main' ? (
                      <div className="text-center p-4 rounded-lg bg-gold/10 animate-pulse">
                        <Sparkles className="w-8 h-8 text-gold mx-auto mb-2 animate-spin" />
                        <p className="text-3xl font-mono font-bold text-gold">
                          {displayNumber || '-----'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-secondary/30">
                        <Trophy className="w-8 h-8 text-gold/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sorteio entre todos os números</p>
                      </div>
                    )}
                    <Button
                      onClick={() => handleDraw('main')}
                      disabled={isAnimating || confirmedNumbers.length === 0}
                      className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                    >
                      {isAnimating && activeDrawType === 'main' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Ticket className="w-4 h-4 mr-2" />
                      )}
                      Sortear
                    </Button>
                    {confirmedNumbers.length === 0 && (
                      <p className="text-xs text-warning text-center flex items-center justify-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Nenhum número confirmado
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 2º Prêmio - Top 10 compradores */}
            <Card className={cn(
              "border-emerald/30 relative overflow-hidden",
              hasTopBuyerWinner && "bg-success/5 border-success/30"
            )}>
              <div className="h-1 bg-emerald" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-emerald" />
                  <CardTitle className="text-lg">2º Prêmio</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {selectedRaffle.prize_top_buyer || 'Não configurado'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasTopBuyerWinner ? (
                  <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                    <PartyPopper className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Ganhador</p>
                    <p className="font-bold text-success">{selectedRaffle.winner_top_buyer_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ({selectedRaffle.winner_top_buyer_number} números)
                    </p>
                  </div>
                ) : (
                  <>
                    {isAnimating && activeDrawType === 'top10' ? (
                      <div className="text-center p-4 rounded-lg bg-emerald/10 animate-pulse">
                        <Sparkles className="w-8 h-8 text-emerald mx-auto mb-2 animate-spin" />
                        <p className="text-lg font-bold text-emerald truncate">
                          {displayName || 'Carregando...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-secondary/30">
                        <Crown className="w-8 h-8 text-emerald/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sorteio entre TOP 10 compradores</p>
                      </div>
                    )}
                    <Button
                      onClick={() => handleDraw('top10')}
                      disabled={isAnimating || top10Buyers.length === 0 || !selectedRaffle.prize_top_buyer}
                      className="w-full bg-emerald text-primary-foreground hover:bg-emerald/90"
                    >
                      {isAnimating && activeDrawType === 'top10' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Crown className="w-4 h-4 mr-2" />
                      )}
                      Sortear
                    </Button>
                    {top10Buyers.length < 10 && top10Buyers.length > 0 && (
                      <p className="text-xs text-warning text-center">
                        Apenas {top10Buyers.length} compradores elegíveis
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* 3º Prêmio - Top 30 compradores */}
            <Card className={cn(
              "border-purple/30 relative overflow-hidden",
              hasSecondTopBuyerWinner && "bg-success/5 border-success/30"
            )}>
              <div className="h-1 bg-purple" />
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Medal className="w-5 h-5 text-purple" />
                  <CardTitle className="text-lg">3º Prêmio</CardTitle>
                </div>
                <CardDescription className="line-clamp-2">
                  {selectedRaffle.prize_second_top_buyer || 'Não configurado'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {hasSecondTopBuyerWinner ? (
                  <div className="text-center p-4 rounded-lg bg-success/10 border border-success/20">
                    <PartyPopper className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-1">Ganhador</p>
                    <p className="font-bold text-success">{selectedRaffle.winner_second_top_buyer_name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      ({selectedRaffle.winner_second_top_buyer_number} números)
                    </p>
                  </div>
                ) : (
                  <>
                    {isAnimating && activeDrawType === 'top30' ? (
                      <div className="text-center p-4 rounded-lg bg-purple/10 animate-pulse">
                        <Sparkles className="w-8 h-8 text-purple mx-auto mb-2 animate-spin" />
                        <p className="text-lg font-bold text-purple truncate">
                          {displayName || 'Carregando...'}
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-4 rounded-lg bg-secondary/30">
                        <Medal className="w-8 h-8 text-purple/50 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Sorteio entre TOP 30 compradores</p>
                      </div>
                    )}
                    <Button
                      onClick={() => handleDraw('top30')}
                      disabled={isAnimating || top30Buyers.length === 0 || !selectedRaffle.prize_second_top_buyer}
                      className="w-full bg-purple text-primary-foreground hover:bg-purple/90"
                    >
                      {isAnimating && activeDrawType === 'top30' ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Medal className="w-4 h-4 mr-2" />
                      )}
                      Sortear
                    </Button>
                    {top30Buyers.length < 30 && top30Buyers.length > 0 && (
                      <p className="text-xs text-warning text-center">
                        Apenas {top30Buyers.length} compradores elegíveis
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Buyers ranking */}
          {topBuyers && topBuyers.length > 0 && (
            <Card className="border-gold/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gold" />
                  Ranking de Compradores
                </CardTitle>
                <CardDescription>
                  Top 30 maiores compradores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {topBuyers.map((buyer, index) => (
                    <div 
                      key={buyer.phone}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg",
                        index < 10 ? "bg-emerald/10 border border-emerald/20" : 
                        index < 30 ? "bg-purple/10 border border-purple/20" : 
                        "bg-secondary/30"
                      )}
                    >
                      <span className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                        index === 0 ? "bg-gold text-primary-foreground" :
                        index < 3 ? "bg-gold/50 text-foreground" :
                        index < 10 ? "bg-emerald/30 text-emerald" :
                        "bg-purple/30 text-purple"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{buyer.name}</p>
                      </div>
                      <span className="text-sm font-bold text-muted-foreground">
                        {buyer.total}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}