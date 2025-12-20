import { usePendingPurchases, useAllPurchases, useUpdatePaymentStatus } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatRaffleNumber, formatPhone } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Mail,
  Phone,
  User
} from 'lucide-react';

export default function AdminPayments() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: pendingPurchases, isLoading: pendingLoading } = usePendingPurchases();
  const { data: allPurchases, isLoading: allLoading } = useAllPurchases();
  const updateStatus = useUpdatePaymentStatus();

  const handleUpdateStatus = async (purchaseId: string, status: 'approved' | 'rejected') => {
    if (!user) return;

    try {
      await updateStatus.mutateAsync({
        purchaseId,
        status,
        userId: user.id,
      });

      toast({
        title: status === 'approved' ? 'Pagamento aprovado!' : 'Pagamento rejeitado',
        description: status === 'approved' 
          ? 'Os números foram confirmados para o comprador.'
          : 'A compra foi rejeitada.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; className: string; icon: any }> = {
      pending: { text: 'Pendente', className: 'bg-warning/20 text-warning', icon: Clock },
      approved: { text: 'Aprovado', className: 'bg-success/20 text-success', icon: CheckCircle2 },
      rejected: { text: 'Rejeitado', className: 'bg-destructive/20 text-destructive', icon: XCircle },
      expired: { text: 'Expirado', className: 'bg-muted text-muted-foreground', icon: Clock },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const PurchaseCard = ({ purchase, showActions = false }: { purchase: any; showActions?: boolean }) => (
    <Card className="border-gold/10">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold">{(purchase.raffle as any)?.title || 'Rifa'}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(purchase.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
          {getStatusBadge(purchase.payment_status)}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{purchase.buyer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="truncate">{purchase.buyer_email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <span>{formatPhone(purchase.buyer_phone)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Qtd: </span>
            <span className="font-medium">{purchase.quantity} números</span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border">
          <span className="text-lg font-bold text-gold">
            {formatCurrency(Number(purchase.total_amount))}
          </span>
          
          {showActions && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleUpdateStatus(purchase.id, 'rejected')}
                disabled={updateStatus.isPending}
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <X className="w-4 h-4 mr-1" />
                Rejeitar
              </Button>
              <Button
                size="sm"
                onClick={() => handleUpdateStatus(purchase.id, 'approved')}
                disabled={updateStatus.isPending}
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                {updateStatus.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {purchase.numbers && purchase.numbers.length > 0 && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Números escolhidos:</p>
            <div className="flex flex-wrap gap-1">
              {purchase.numbers.slice(0, 20).map((n: any) => (
                <span key={n.number} className="px-1.5 py-0.5 rounded bg-gold/20 text-gold text-xs font-mono">
                  {formatRaffleNumber(n.number, 5)}
                </span>
              ))}
              {purchase.numbers.length > 20 && (
                <span className="px-1.5 py-0.5 text-xs text-muted-foreground">
                  +{purchase.numbers.length - 20} mais
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Pagamentos</h1>
        <p className="text-muted-foreground">Gerencie os pagamentos das rifas</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="relative">
            Pendentes
            {pendingPurchases && pendingPurchases.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-warning text-warning-foreground text-xs">
                {pendingPurchases.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all">Todos</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : pendingPurchases && pendingPurchases.length > 0 ? (
            <div className="grid gap-4">
              {pendingPurchases.map((purchase) => (
                <PurchaseCard key={purchase.id} purchase={purchase} showActions />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle2 className="w-12 h-12 text-success/50 mb-4" />
                <p className="text-muted-foreground">Nenhum pagamento pendente</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {allLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-gold" />
            </div>
          ) : allPurchases && allPurchases.length > 0 ? (
            <div className="grid gap-4">
              {allPurchases.map((purchase) => (
                <PurchaseCard 
                  key={purchase.id} 
                  purchase={purchase} 
                  showActions={purchase.payment_status === 'pending'} 
                />
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground">Nenhuma compra realizada</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
