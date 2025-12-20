import { useAdminStats, useAllRaffles, usePendingPurchases } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { 
  DollarSign, 
  Ticket, 
  Clock, 
  TrendingUp,
  Loader2,
  AlertCircle
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
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral do sistema de rifas</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Confirmada
            </CardTitle>
            <DollarSign className="w-4 h-4 text-success" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Pendente
            </CardTitle>
            <Clock className="w-4 h-4 text-warning" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-warning">
              {formatCurrency(stats?.pendingRevenue || 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Números Vendidos
            </CardTitle>
            <Ticket className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalSold || 0}</p>
            {activeRaffle && (
              <p className="text-xs text-muted-foreground">
                de {activeRaffle.total_numbers.toLocaleString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-gold/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Compras
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-gold" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalPurchases || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending payments alert */}
      {pendingPurchases && pendingPurchases.length > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium">Pagamentos pendentes</p>
                <p className="text-sm text-muted-foreground">
                  {pendingPurchases.length} pagamento(s) aguardando confirmação
                </p>
              </div>
            </div>
            <Link to="/admin/pagamentos">
              <Button size="sm" className="bg-warning text-warning-foreground hover:bg-warning/90">
                Ver pagamentos
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Active raffle info */}
      {activeRaffle ? (
        <Card className="border-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-gold" />
              Rifa Ativa
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{activeRaffle.title}</h3>
              <p className="text-muted-foreground">{activeRaffle.prize_description}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Preço/número</p>
                <p className="font-semibold">{formatCurrency(Number(activeRaffle.price_per_number))}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de números</p>
                <p className="font-semibold">{activeRaffle.total_numbers.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data do sorteio</p>
                <p className="font-semibold">
                  {activeRaffle.draw_date 
                    ? new Date(activeRaffle.draw_date).toLocaleDateString('pt-BR')
                    : 'Não definida'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                  Ativa
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/rifa">
                <Button variant="outline" size="sm">Editar rifa</Button>
              </Link>
              <Link to="/admin/sorteio">
                <Button size="sm" className="bg-gold text-primary-foreground hover:bg-gold/90">
                  Realizar sorteio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-2 border-gold/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ticket className="w-12 h-12 text-gold/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma rifa ativa</h3>
            <p className="text-muted-foreground text-center mb-4">
              Crie uma nova rifa para começar a vender
            </p>
            <Link to="/admin/rifa">
              <Button className="bg-gold text-primary-foreground hover:bg-gold/90">
                Criar nova rifa
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
