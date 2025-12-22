import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Search, Users, KeyRound, Loader2, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CustomerAccount {
  id: string;
  phone: string;
  created_at: string;
  updated_at: string;
  purchase_count?: number;
}

export default function AdminCustomers() {
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerAccount | null>(null);
  const [newPin, setNewPin] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers with purchase count
  const { data: customers, isLoading } = useQuery({
    queryKey: ['admin-customers', searchPhone],
    queryFn: async () => {
      let query = supabase
        .from('customer_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchPhone) {
        const cleanPhone = searchPhone.replace(/\D/g, '');
        query = query.ilike('phone', `%${cleanPhone}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Get purchase counts for each customer
      const customersWithCounts = await Promise.all(
        (data || []).map(async (customer) => {
          const { count } = await supabase
            .from('purchases')
            .select('*', { count: 'exact', head: true })
            .eq('buyer_phone', customer.phone)
            .eq('payment_status', 'approved');
          
          return {
            ...customer,
            purchase_count: count || 0,
          };
        })
      );

      return customersWithCounts as CustomerAccount[];
    },
  });

  // Reset PIN mutation
  const resetPinMutation = useMutation({
    mutationFn: async ({ phone, pin }: { phone: string; pin: string }) => {
      const response = await supabase.functions.invoke('customer-auth', {
        body: { phone, pin, action: 'reset-pin' },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'PIN redefinido!',
        description: `Novo PIN definido para ${formatPhone(selectedCustomer?.phone || '')}`,
      });
      setIsResetDialogOpen(false);
      setNewPin('');
      setSelectedCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao redefinir PIN',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  const handleResetPin = () => {
    if (!selectedCustomer || newPin.length !== 4) return;
    resetPinMutation.mutate({ phone: selectedCustomer.phone, pin: newPin });
  };

  const openResetDialog = (customer: CustomerAccount) => {
    setSelectedCustomer(customer);
    setNewPin('');
    setIsResetDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-gradient-gold">Clientes</h1>
        <p className="text-muted-foreground">Gerencie contas de clientes e redefina PINs</p>
      </div>

      <Card className="border-gold/20 bg-card/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-emerald" />
            Contas de Clientes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por telefone..."
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="pl-9 bg-background/50 border-gold/20"
              />
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : customers?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum cliente encontrado</p>
            </div>
          ) : (
            <div className="border border-gold/20 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="text-gold">Telefone</TableHead>
                    <TableHead className="text-gold">Cadastro</TableHead>
                    <TableHead className="text-gold text-center">Compras</TableHead>
                    <TableHead className="text-gold text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers?.map((customer) => (
                    <TableRow key={customer.id} className="border-gold/10">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {formatPhone(customer.phone)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(customer.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald/20 text-emerald font-medium">
                          {customer.purchase_count}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openResetDialog(customer)}
                          className="border-gold/30 hover:bg-gold/10 hover:text-gold"
                        >
                          <KeyRound className="w-4 h-4 mr-1" />
                          Redefinir PIN
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset PIN Dialog */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="border-gold/20 bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-gold" />
              Redefinir PIN
            </DialogTitle>
            <DialogDescription>
              Defina um novo PIN de 4 dígitos para o cliente{' '}
              <span className="text-emerald font-medium">
                {formatPhone(selectedCustomer?.phone || '')}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center py-6">
            <InputOTP
              maxLength={4}
              value={newPin}
              onChange={setNewPin}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} className="w-14 h-14 text-2xl border-gold/30" />
                <InputOTPSlot index={1} className="w-14 h-14 text-2xl border-gold/30" />
                <InputOTPSlot index={2} className="w-14 h-14 text-2xl border-gold/30" />
                <InputOTPSlot index={3} className="w-14 h-14 text-2xl border-gold/30" />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsResetDialogOpen(false)}
              className="text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleResetPin}
              disabled={newPin.length !== 4 || resetPinMutation.isPending}
              className="btn-luck text-primary-foreground"
            >
              {resetPinMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar novo PIN'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
