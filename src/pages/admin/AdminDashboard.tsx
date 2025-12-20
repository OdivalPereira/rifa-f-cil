import { useAdminStats, useAllRaffles, usePendingPurchases } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { 
  DollarSign, 
  Ticket, 
  Clock, 
  TrendingUp,
  Loader2,
  AlertCircle,
  Sparkles,
  Trophy,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: raffles } = useAllRaffles();
  const { data: pendingPurchases } = usePendingPurchases();

  const activeRaffle = raffles?.find(r => r.status === 'active');

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald mx-auto" />
          <p className="text-muted-foreground">Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-gradient-luck glow-emerald">
          <span className="text-2xl">🍀</span>
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-gradient-luck">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do sistema de rifas</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-casino border-emerald/20 overflow-hidden group hover:border-emerald/40 transition-all">
          <div className="h-1 bg-gradient-luck" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Confirmada
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald/10">
              <DollarSign className="w-4 h-4 text-emerald" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-emerald">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-casino border-gold/20 overflow-hidden group hover:border-gold/40 transition-all">
          <div className="h-1 bg-gradient-gold" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Pendente
            </CardTitle>
            <div className="p-2 rounded-lg bg-gold/10">
              <Clock className="w-4 h-4 text-gold" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-gold">
              {formatCurrency(stats?.pendingRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="card-casino border-purple/20 overflow-hidden group hover:border-purple/40 transition-all">
          <div className="h-1 bg-gradient-to-r from-purple-dark via-purple to-purple-light" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Números Vendidos
            </CardTitle>
            <div className="p-2 rounded-lg bg-purple/10">
              <Ticket className="w-4 h-4 text-purple" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-purple">{stats?.totalSold || 0}</p>
            {activeRaffle && (
              <p className="text-xs text-muted-foreground mt-1">
                de {activeRaffle.total_numbers.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="card-casino border-emerald/20 overflow-hidden group hover:border-emerald/40 transition-all">
          <div className="h-1 bg-gradient-jackpot" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Compras
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald/10">
              <TrendingUp className="w-4 h-4 text-emerald" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-display font-bold text-foreground">{stats?.totalPurchases || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending payments alert */}
      {pendingPurchases && pendingPurchases.length > 0 && (
        <Card className="border-gold/30 bg-gold/5 card-jackpot overflow-hidden">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gold/20 animate-pulse">
                <AlertCircle className="w-5 h-5 text-gold" />
              </div>
              <div>
                <p className="font-semibold text-gold">Pagamentos pendentes</p>
                <p className="text-sm text-muted-foreground">
                  {pendingPurchases.length} pagamento(s) aguardando confirmação
                </p>
              </div>
            </div>
            <Link to="/admin/pagamentos">
              <Button size="sm" className="bg-gold hover:bg-gold-light text-accent-foreground font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Ver pagamentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active raffle info */}
      {activeRaffle ? (
        <Card className="card-jackpot border-emerald/20 overflow-hidden">
          <div className="h-1 bg-gradient-luck" />
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald/10">
                <span className="text-xl">🍀</span>
              </div>
              <span className="text-gradient-luck">Rifa Ativa</span>
              <Sparkles className="w-4 h-4 text-gold" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-2xl font-display font-bold">{activeRaffle.title}</h3>
              <p className="text-muted-foreground">{activeRaffle.prize_description}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  Preço/número
                </p>
                <p className="text-xl font-display font-bold text-emerald">{formatCurrency(Number(activeRaffle.price_per_number))}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Ticket className="w-3 h-3" />
                  Total de números
                </p>
                <p className="text-xl font-display font-bold">{activeRaffle.total_numbers.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Data do sorteio
                </p>
                <p className="text-xl font-display font-bold">
                  {activeRaffle.draw_date 
                    ? new Date(activeRaffle.draw_date).toLocaleDateString('pt-BR')
                    : 'Não definida'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  Status
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald/20 text-emerald mt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald mr-2 animate-pulse" />
                  Ativa
                </span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link to="/admin/rifa">
                <Button variant="outline" size="sm" className="border-emerald/30 hover:border-emerald">
                  <Ticket className="w-4 h-4 mr-2" />
                  Editar rifa
                </Button>
              </Link>
              <Link to="/admin/sorteio">
                <Button size="sm" className="btn-luck text-primary-foreground font-semibold">
                  <Trophy className="w-4 h-4 mr-2" />
                  Realizar sorteio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-emerald/30 bg-emerald/5">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <span className="text-7xl opacity-50">🍀</span>
              <Sparkles className="w-6 h-6 text-gold absolute -top-2 -right-2 animate-sparkle" />
            </div>
            <h3 className="text-xl font-display font-bold mb-2">Nenhuma rifa ativa</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              Crie uma nova rifa para começar a vender números da sorte
            </p>
            <Link to="/admin/rifa">
              <Button className="btn-luck text-primary-foreground font-semibold">
                <span className="mr-2">✨</span>
                Criar nova rifa
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
