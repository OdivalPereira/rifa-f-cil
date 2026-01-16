import { usePendingPurchases, useAllPurchases, useUpdatePaymentStatus } from '@/hooks/useAdmin';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency, formatRaffleNumber, formatPhone, getPixTxId } from '@/lib/validators';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Check, X, Clock, CheckCircle2, XCircle,
  Mail, Phone, User, FileText, ExternalLink, Image as ImageIcon
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
        variant: status === 'approved' ? 'default' : 'destructive',
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
      pending: { text: 'Pendente', className: 'bg-warning/20 text-warning border-warning/30', icon: Clock },
      approved: { text: 'Aprovado', className: 'bg-emerald/20 text-emerald border-emerald/30', icon: CheckCircle2 },
      rejected: { text: 'Rejeitado', className: 'bg-destructive/20 text-destructive border-destructive/30', icon: XCircle },
      expired: { text: 'Expirado', className: 'bg-muted text-muted-foreground border-border', icon: Clock },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.className}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const PurchaseCard = ({ purchase, showActions = false }: { purchase: any; showActions?: boolean }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      layout
    >
      <Card className="card-casino border-border/50 hover:border-gold/30 transition-colors overflow-hidden group">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row">
            {/* Left side: Info */}
            <div className="flex-1 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-foreground group-hover:text-gold transition-colors">
                    {(purchase.raffle as any)?.title || 'Rifa'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="bg-muted px-1.5 py-0.5 rounded text-foreground">ID BANCO: {getPixTxId(purchase.id)}</span>
                    <span>• {new Date(purchase.created_at).toLocaleString('pt-BR')}</span>
                  </p>
                </div>
                {getStatusBadge(purchase.payment_status)}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black leading-none mb-1">Comprador</span>
                    <span className="font-bold leading-none">{purchase.buyer_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Phone className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black leading-none mb-1">WhatsApp</span>
                    <span className="font-mono leading-none">{formatPhone(purchase.buyer_phone)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black leading-none mb-1">E-mail</span>
                    <span className="truncate leading-none opacity-80">{purchase.buyer_email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-emerald" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-black leading-none mb-1">Quantidade</span>
                    <span className="font-bold leading-none text-emerald-light">{purchase.quantity} COTAS</span>
                  </div>
                </div>
              </div>

              {purchase.numbers && purchase.numbers.length > 0 && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Números Reservados</p>
                  <div className="flex flex-wrap gap-1.5">
                    {purchase.numbers.slice(0, 15).map((n: any) => (
                      <span key={n.number} className="px-2 py-0.5 rounded-md bg-gold/10 border border-gold/20 text-gold text-[10px] font-mono font-bold">
                        {formatRaffleNumber(n.number, 5)}
                      </span>
                    ))}
                    {purchase.numbers.length > 15 && (
                      <span className="px-2 py-0.5 text-[10px] text-muted-foreground font-bold">
                        +{purchase.numbers.length - 15} MAIS
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right side: Actions & Receipt */}
            <div className="w-full sm:w-64 bg-muted/20 p-5 flex flex-col justify-between border-t sm:border-t-0 sm:border-l border-border/50 transition-colors group-hover:bg-muted/30">
              <div className="space-y-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase font-black mb-1">Valor Total</span>
                  <span className="text-3xl font-display font-bold text-gradient-gold">
                    {formatCurrency(Number(purchase.total_amount))}
                  </span>
                </div>

                {/* Receipt Preview */}
                {purchase.receipt_url ? (
                  <a
                    href={purchase.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative group/receipt overflow-hidden rounded-xl border border-border/50 aspect-video bg-black/40"
                  >
                    <img src={purchase.receipt_url} alt="Comprovante" className="w-full h-full object-cover transition-transform group-hover/receipt:scale-110" />
                    <div className="absolute inset-0 bg-emerald/60 opacity-0 group-hover/receipt:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                      <ImageIcon className="w-6 h-6 text-white" />
                      <span className="text-white text-[10px] font-black uppercase tracking-tighter">Ver Comprovante</span>
                    </div>
                  </a>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 opacity-50 grayscale">
                    <Loader2 className="w-6 h-6 mb-2 text-muted-foreground" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">Sem Comprovante</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-6">
                {showActions && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(purchase.id, 'rejected')}
                      disabled={updateStatus.isPending}
                      className="h-10 border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive font-bold uppercase text-[10px] tracking-wider"
                    >
                      REJEITAR
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(purchase.id, 'approved')}
                      disabled={updateStatus.isPending}
                      className="h-10 bg-emerald hover:bg-emerald/90 text-white font-black uppercase text-[10px] tracking-wider shadow-lg shadow-emerald/20"
                    >
                      {updateStatus.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'APROVAR'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-gradient-luck">Controle de Pagamentos</h1>
          <p className="text-muted-foreground font-medium">Valide as participações e dê início à sorte!</p>
        </div>
        <div className="flex h-12 items-center px-4 rounded-2xl bg-card border border-border shadow-sm">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Última atualização: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-muted/50 p-1.5 rounded-2xl border border-border/50 h-auto">
          <TabsTrigger value="pending" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-lg font-bold uppercase tracking-wider text-xs gap-3">
            <Clock className="w-4 h-4" />
            Pendentes
            {pendingPurchases && pendingPurchases.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald text-white text-[10px] font-black animate-pulse">
                {pendingPurchases.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-card data-[state=active]:shadow-lg font-bold uppercase tracking-wider text-xs gap-3">
            <FileText className="w-4 h-4" />
            Histórico Completo
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="pending" className="space-y-4 outline-none">
            {pendingLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Buscando pendências...</p>
              </div>
            ) : pendingPurchases && pendingPurchases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {pendingPurchases.map((purchase) => (
                  <PurchaseCard key={purchase.id} purchase={purchase} showActions />
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card className="border-dashed border-2 py-20 bg-emerald/5">
                  <CardContent className="flex flex-col items-center justify-center text-center max-w-xs mx-auto">
                    <div className="w-20 h-20 rounded-full bg-emerald/10 flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">Tudo em dia!</h3>
                    <p className="text-sm text-muted-foreground">Não há pagamentos aguardando aprovação no momento.</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 outline-none">
            {allLoading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald" />
                <p className="text-sm font-bold text-muted-foreground animate-pulse uppercase tracking-widest">Carregando histórico...</p>
              </div>
            ) : allPurchases && allPurchases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {allPurchases.map((purchase) => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    showActions={purchase.payment_status === 'pending'}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground uppercase font-bold tracking-widest text-sm opacity-50">
                Nenhum registro encontrado
              </div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}
