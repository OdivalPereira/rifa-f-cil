import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMyPurchases } from '@/hooks/useRaffle';
import { formatCurrency, formatRaffleNumber } from '@/lib/validators';
import { Search, Loader2, ArrowLeft, Clover, Sparkles, Star, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';

export default function MyNumbers() {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'email' | 'phone'>('email');
  const [submitted, setSubmitted] = useState(false);

  const email = searchType === 'email' && submitted ? searchValue : '';
  const phone = searchType === 'phone' && submitted ? searchValue : '';

  const { data: purchases, isLoading } = useMyPurchases(email, phone);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
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
          <div className="container mx-auto px-4 h-16 flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="hover:bg-gold/10 hover:text-gold">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <Clover className="w-6 h-6 text-emerald clover-icon" />
              <span className="font-display font-semibold text-lg text-gradient-gold">Meus Números</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="card-jackpot p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <Star className="w-5 h-5 text-gold animate-sparkle" />
                <Trophy className="w-8 h-8 text-gold" />
                <Star className="w-5 h-5 text-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <h1 className="text-2xl font-display text-gradient-gold">Consultar Meus Números</h1>
              <p className="text-muted-foreground mt-2">Busque suas compras por e-mail ou telefone</p>
            </div>
            
            {/* Search form */}
            <form onSubmit={handleSearch} className="space-y-4 relative z-10">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setSearchType('email'); setSubmitted(false); }}
                  className={`flex-1 h-11 font-medium transition-all ${
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
                  onClick={() => { setSearchType('phone'); setSubmitted(false); }}
                  className={`flex-1 h-11 font-medium transition-all ${
                    searchType === 'phone' 
                      ? 'bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30' 
                      : 'border border-border/50 hover:bg-muted/50'
                  }`}
                >
                  Telefone
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={searchType === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                  value={searchValue}
                  onChange={(e) => { setSearchValue(e.target.value); setSubmitted(false); }}
                  className="input-casino h-12 flex-1"
                />
                <Button type="submit" className="btn-luck h-12 px-6">
                  <Search className="w-5 h-5" />
                </Button>
              </div>
            </form>

            {/* Loading */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-gold" />
                <p className="text-muted-foreground">Buscando seus números...</p>
              </div>
            )}

            {/* No results */}
            {submitted && !isLoading && purchases?.length === 0 && (
              <div className="text-center py-12">
                <Clover className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma compra encontrada.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Verifique os dados e tente novamente.</p>
              </div>
            )}

            {/* Results */}
            {purchases && purchases.length > 0 && (
              <div className="space-y-4 mt-6 relative z-10">
                {purchases.map((purchase: any) => {
                  const status = getStatusLabel(purchase.payment_status);
                  return (
                    <div 
                      key={purchase.id} 
                      className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3 hover:border-gold/30 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-display font-medium text-lg">{purchase.raffle?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${status.color}`}>
                          {status.icon}
                          {status.text}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{purchase.quantity} números</span>
                        <span className="font-bold text-gold">{formatCurrency(Number(purchase.total_amount))}</span>
                      </div>
                      {purchase.numbers && purchase.numbers.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border/30">
                          {purchase.numbers.map((n: any) => (
                            <span 
                              key={n.number} 
                              className="px-2.5 py-1 rounded-md bg-emerald/10 text-emerald text-xs font-mono font-bold border border-emerald/20"
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

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors"
            >
              <Clover className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </main>
      </div>
    </SlotMachineFrame>
  );
}
