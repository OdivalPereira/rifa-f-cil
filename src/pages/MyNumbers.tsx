import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMyPurchases } from '@/hooks/useRaffle';
import { formatCurrency, formatRaffleNumber, formatPhone } from '@/lib/validators';
import { Search, Ticket, Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    const labels: Record<string, { text: string; color: string }> = {
      pending: { text: 'Aguardando pagamento', color: 'text-warning' },
      approved: { text: 'Confirmado', color: 'text-success' },
      rejected: { text: 'Rejeitado', color: 'text-destructive' },
      expired: { text: 'Expirado', color: 'text-muted-foreground' },
    };
    return labels[status] || { text: status, color: '' };
  };

  return (
    <div className="min-h-screen bg-background pattern-luxury">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-gold" />
            <span className="font-display font-semibold text-lg">Meus Números</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-gold/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-display">Consultar Meus Números</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={searchType === 'email' ? 'default' : 'outline'}
                  onClick={() => { setSearchType('email'); setSubmitted(false); }}
                  className={searchType === 'email' ? 'bg-gold hover:bg-gold/90' : ''}
                >
                  E-mail
                </Button>
                <Button
                  type="button"
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => { setSearchType('phone'); setSubmitted(false); }}
                  className={searchType === 'phone' ? 'bg-gold hover:bg-gold/90' : ''}
                >
                  Telefone
                </Button>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder={searchType === 'email' ? 'seu@email.com' : '(11) 99999-9999'}
                  value={searchValue}
                  onChange={(e) => { setSearchValue(e.target.value); setSubmitted(false); }}
                />
                <Button type="submit" className="bg-gradient-gold text-primary-foreground">
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gold" />
              </div>
            )}

            {submitted && !isLoading && purchases?.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma compra encontrada.
              </p>
            )}

            {purchases && purchases.length > 0 && (
              <div className="space-y-4">
                {purchases.map((purchase: any) => {
                  const status = getStatusLabel(purchase.payment_status);
                  return (
                    <div key={purchase.id} className="p-4 rounded-lg bg-secondary/50 border border-border space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{purchase.raffle?.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <span className={`text-sm font-medium ${status.color}`}>{status.text}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{purchase.quantity} números</span>
                        <span className="font-medium text-gold">{formatCurrency(Number(purchase.total_amount))}</span>
                      </div>
                      {purchase.numbers && purchase.numbers.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {purchase.numbers.map((n: any) => (
                            <span key={n.number} className="px-2 py-0.5 rounded bg-gold/20 text-gold text-xs font-mono">
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
