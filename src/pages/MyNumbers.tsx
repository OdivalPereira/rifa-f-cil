import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMyPurchases } from '@/hooks/useRaffle';
import { formatCurrency, formatRaffleNumber } from '@/lib/validators';
import { ArrowLeft, Clover, Sparkles, Star, Trophy, LogOut } from 'lucide-react';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import ReferralDashboard from '@/components/ReferralDashboard';

export default function MyNumbers() {
  const navigate = useNavigate();
  const { isAuthenticated, phone, isLoading: authLoading, logout } = useCustomerAuth();

  // Redirect to /conta if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/conta');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Fetch purchases using the authenticated phone
  const { data: purchases, isLoading: purchasesLoading } = useMyPurchases('', phone || '');

  const isLoading = authLoading || purchasesLoading;

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
      pending: { text: 'Aguardando pagamento', color: 'text-gold', icon: <Sparkles className="w-4 h-4" /> },
      approved: { text: 'Confirmado', color: 'text-emerald', icon: <Clover className="w-4 h-4" /> },
      rejected: { text: 'Rejeitado', color: 'text-destructive', icon: null },
      expired: { text: 'Expirado', color: 'text-muted-foreground', icon: null },
    };
    return labels[status] || { text: status, color: '', icon: null };
  };

  const handleLogout = () => {
    logout();
    navigate('/conta');
  };

  // Format phone for display
  const formatPhoneDisplay = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    const digits = phoneNumber.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    }
    if (digits.length === 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }
    return phoneNumber;
  };

  if (authLoading) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex items-center justify-center">
          <Clover className="w-10 h-10 animate-spin text-gold" />
        </div>
      </SlotMachineFrame>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <SlotMachineFrame>
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative z-10 border-b border-gold/20 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-gold/10 hover:text-gold h-9 w-9 sm:h-10 sm:w-10"
                  aria-label="Voltar para início"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 sm:gap-3">
                <Clover className="w-5 h-5 sm:w-6 sm:h-6 text-emerald clover-icon" />
                <span className="font-display font-semibold text-base sm:text-lg text-gradient-gold">Meus Números</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">

          <ReferralDashboard />

          <div className="card-jackpot p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold animate-sparkle" />
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <h1 className="text-xl sm:text-2xl font-display text-gradient-gold">Meus Números da Sorte</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm">
                Telefone: {formatPhoneDisplay(phone || '')}
              </p>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3">
                <Clover className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-gold" />
                <p className="text-muted-foreground text-sm">Carregando seus números...</p>
              </div>
            )}

            {/* No results */}
            {!isLoading && purchases?.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Clover className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma compra encontrada.</p>
                <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">
                  Compre números usando este telefone para vê-los aqui.
                </p>
              </div>
            )}

            {/* Results */}
            {purchases && purchases.length > 0 && (
              <div className="space-y-3 sm:space-y-4 relative z-10">
                {purchases.map((purchase) => {
                  const status = getStatusLabel(purchase.payment_status);
                  return (
                    <div 
                      key={purchase.id} 
                      className="p-3 sm:p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2 sm:space-y-3 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-display font-medium text-sm sm:text-lg truncate">{purchase.raffle?.title}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium ${status.color} shrink-0`}>
                          {status.icon}
                          <span className="hidden sm:inline">{status.text}</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">{purchase.quantity} números</span>
                        <span className="font-bold text-gold">{formatCurrency(Number(purchase.total_amount))}</span>
                      </div>
                      {purchase.numbers && purchase.numbers.length > 0 && (
                        <div className="flex flex-wrap gap-1 sm:gap-1.5 pt-2 border-t border-border/30">
                          {purchase.numbers.map((n: { number: number }) => (
                            <span 
                              key={n.number} 
                              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md bg-emerald/10 text-emerald text-[10px] sm:text-xs font-mono font-bold border border-emerald/20"
                            >
                              {formatRaffleNumber(n.number, 5)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buy More / Back to home */}
          <div className="flex flex-col gap-3 mt-8 max-w-sm mx-auto">
            <Link to="/" className="w-full">
              <Button className="w-full btn-luck text-primary-foreground font-bold py-6">
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Comprar mais números
              </Button>
            </Link>

            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-emerald transition-colors p-2"
            >
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </main>
      </div>
    </SlotMachineFrame>
  );
}
