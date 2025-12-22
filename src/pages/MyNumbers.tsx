import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMyPurchases } from '@/hooks/useRaffle';
import { formatCurrency, formatRaffleNumber } from '@/lib/validators';
import { Search, ArrowLeft, Clover, Sparkles, Star, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';

export default function MyNumbers() {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const email = searchType === 'email' && submitted ? searchValue : '';
  const phone = searchType === 'phone' && submitted ? searchValue : '';

  const { data: purchases, isLoading } = useMyPurchases(email, phone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) {
      setError('Por favor, preencha este campo.');
      return;
    }
    setSubmitted(true);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string; icon: React.ReactNode }> = {
      pending: { text: 'Aguardando pagamento', color: 'text-gold', icon: <Sparkles className="w-4 h-4" /> },
      approved: { text: 'Confirmado', color: 'text-emerald', icon: <Clover className="w-4 h-4" /> },
      rejected: { text: 'Rejeitado', color: 'text-destructive', icon: null },
      expired: { text: 'Expirado', color: 'text-muted-foreground', icon: null },
    };
    return labels[status] || { text: status, color: '', icon: null };
  };

  return (
    <SlotMachineFrame>
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative z-10 border-b border-gold/20 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
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
        </header>

        {/* Main content */}
        <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">

          <div className="card-jackpot p-4 sm:p-6">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-2 sm:mb-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold animate-sparkle" />
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gold" />
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <h1 className="text-xl sm:text-2xl font-display text-gradient-gold">Consultar Meus Números</h1>
              <p className="text-muted-foreground mt-1 sm:mt-2 text-sm">Busque suas compras por e-mail ou telefone</p>
            </div>
            
            {/* Search form */}
            <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4 relative z-10">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setSearchType('email'); setSubmitted(false); setError(''); }}
                  className={`flex-1 h-10 sm:h-11 font-medium transition-all text-sm ${
                    searchType === 'email' 
                      ? 'bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30' 
                      : 'border border-border/50 hover:bg-muted/50'
                  }`}
                >
                  E-mail
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setSearchType('phone'); setSubmitted(false); setError(''); }}
                  className={`flex-1 h-10 sm:h-11 font-medium transition-all text-sm ${
                    searchType === 'phone' 
                      ? 'bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30' 
                      : 'border border-border/50 hover:bg-muted/50'
                  }`}
                >
                  Telefone
                </Button>
              </div>
              <div className="relative">
                <div className="flex gap-2">
                  <Input
                    type={searchType === 'email' ? 'email' : 'tel'}
                    inputMode={searchType === 'email' ? 'email' : 'tel'}
                    placeholder={searchType === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                    value={searchValue}
                    onChange={(e) => {
                      setSearchValue(e.target.value);
                      setSubmitted(false);
                      setError('');
                    }}
                    className={`input-casino h-10 sm:h-12 flex-1 text-sm ${error ? 'border-destructive' : ''}`}
                    aria-invalid={!!error}
                  />
                  <Button
                    type="submit"
                    className="btn-luck h-10 sm:h-12 px-4 sm:px-6"
                    disabled={isLoading}
                    aria-label="Buscar números"
                  >
                    {isLoading ? (
                      <Clover className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-destructive text-xs mt-1 absolute -bottom-5 left-0">{error}</p>
                )}
              </div>
            </form>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12 gap-3">
                <Clover className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-gold" />
                <p className="text-muted-foreground text-sm">Buscando seus números...</p>
              </div>
            )}

            {/* No results */}
            {submitted && !isLoading && purchases?.length === 0 && (
              <div className="text-center py-8 sm:py-12">
                <Clover className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nenhuma compra encontrada.</p>
                <p className="text-xs sm:text-sm text-muted-foreground/70 mt-1">Verifique os dados e tente novamente.</p>
              </div>
            )}

            {/* Results */}
            {purchases && purchases.length > 0 && (
              <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 relative z-10">
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
