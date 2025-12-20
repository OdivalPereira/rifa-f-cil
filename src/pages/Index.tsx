import { useState } from 'react';
import { RaffleHero } from '@/components/raffle/RaffleHero';
import { BuyerForm } from '@/components/raffle/BuyerForm';
import { PixPayment } from '@/components/raffle/PixPayment';
import { NumberSelector } from '@/components/raffle/NumberSelector';
import { useActiveRaffle, useSoldNumbers, useCreatePurchase, useReserveNumbers } from '@/hooks/useRaffle';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, Search, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import type { BuyerFormData } from '@/lib/validators';

type Step = 'hero' | 'form' | 'payment' | 'numbers' | 'success';

export default function Index() {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('hero');
  const [purchaseData, setPurchaseData] = useState<{
    id: string;
    quantity: number;
    amount: number;
    expiresAt: string;
  } | null>(null);

  const { data: raffle, isLoading: raffleLoading } = useActiveRaffle();
  const { data: soldNumbersData } = useSoldNumbers(raffle?.id);
  const createPurchase = useCreatePurchase();
  const reserveNumbers = useReserveNumbers();

  const soldNumbers = soldNumbersData?.filter(n => n.confirmed_at).map(n => n.number) || [];
  const pendingNumbers = soldNumbersData?.filter(n => !n.confirmed_at).map(n => n.number) || [];

  const handleParticipate = () => setStep('form');

  const handleBuyerSubmit = async (data: BuyerFormData & { quantity: number }) => {
    if (!raffle) return;

    try {
      const purchase = await createPurchase.mutateAsync({
        raffleId: raffle.id,
        buyerName: data.name,
        buyerEmail: data.email,
        buyerPhone: data.phone,
        quantity: data.quantity,
        pricePerNumber: Number(raffle.price_per_number),
      });

      setPurchaseData({
        id: purchase.id,
        quantity: data.quantity,
        amount: Number(purchase.total_amount),
        expiresAt: purchase.expires_at,
      });

      setStep('payment');
    } catch {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua compra. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleNumbersConfirm = async (numbers: number[]) => {
    if (!raffle || !purchaseData) return;

    try {
      await reserveNumbers.mutateAsync({
        raffleId: raffle.id,
        purchaseId: purchaseData.id,
        numbers,
      });

      setStep('success');
      toast({
        title: '🍀 Números reservados!',
        description: 'Aguarde a confirmação do pagamento. Boa sorte!',
      });
    } catch {
      toast({
        title: 'Erro',
        description: 'Alguns números podem já ter sido escolhidos. Tente outros.',
        variant: 'destructive',
      });
    }
  };

  if (raffleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pattern-casino">
        <div className="text-center space-y-4">
          <div className="relative">
            <Loader2 className="w-12 h-12 animate-spin text-emerald mx-auto" />
            <Sparkles className="w-6 h-6 text-gold absolute -top-2 -right-2 animate-sparkle" />
          </div>
          <p className="text-muted-foreground">Carregando sorte...</p>
        </div>
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pattern-casino">
        <div className="text-center space-y-6 max-w-md px-4">
          <div className="relative inline-block">
            <span className="text-8xl">🍀</span>
            <Star className="w-8 h-8 text-gold absolute -top-2 -right-2 animate-sparkle" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gradient-luck">Nenhuma rifa ativa</h1>
          <p className="text-muted-foreground">Volte em breve para tentar a sorte! ✨</p>
          <Link to="/meus-numeros">
            <Button variant="outline" className="border-emerald/30 hover:border-emerald hover:bg-emerald/10">
              <Search className="w-4 h-4 mr-2" />
              Consultar meus números
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍀</span>
            <span className="font-display font-bold text-lg text-gradient-luck">Rifa da Sorte</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/meus-numeros">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-emerald">
                <Search className="w-4 h-4 mr-2" />
                Meus Números
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-purple/30 hover:border-purple hover:bg-purple/10 text-purple">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {step === 'hero' && (
          <RaffleHero
            title={raffle.title}
            description={raffle.description}
            prizeDescription={raffle.prize_description}
            imageUrl={raffle.image_url}
            pricePerNumber={Number(raffle.price_per_number)}
            totalNumbers={raffle.total_numbers}
            soldNumbers={soldNumbers.length}
            drawDate={raffle.draw_date}
            onParticipate={handleParticipate}
          />
        )}

        {step === 'form' && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-casino">
            <BuyerForm
              pricePerNumber={Number(raffle.price_per_number)}
              maxNumbers={raffle.total_numbers - soldNumbers.length}
              onSubmit={handleBuyerSubmit}
              isLoading={createPurchase.isPending}
            />
          </div>
        )}

        {step === 'payment' && purchaseData && raffle.pix_key && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-casino">
            <div className="space-y-6">
              <PixPayment
                amount={purchaseData.amount}
                pixKey={raffle.pix_key}
                pixKeyType={raffle.pix_key_type || 'random'}
                beneficiaryName={raffle.pix_beneficiary_name || 'Organizador'}
                purchaseId={purchaseData.id}
                expiresAt={purchaseData.expiresAt}
              />
              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('numbers')}
                  className="border-emerald/30 hover:border-emerald hover:bg-emerald/10"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-gold" />
                  Já paguei - Escolher meus números da sorte
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'numbers' && purchaseData && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-casino">
            <NumberSelector
              raffleId={raffle.id}
              totalNumbers={raffle.total_numbers}
              quantityToSelect={purchaseData.quantity}
              soldNumbers={soldNumbers}
              pendingNumbers={pendingNumbers}
              onConfirm={handleNumbersConfirm}
              isLoading={reserveNumbers.isPending}
            />
          </div>
        )}

        {step === 'success' && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-casino">
            <div className="text-center space-y-8 max-w-md">
              {/* Animated success icon */}
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full bg-gradient-luck flex items-center justify-center mx-auto glow-emerald animate-pulse-glow">
                  <span className="text-5xl">🍀</span>
                </div>
                <Star className="w-8 h-8 text-gold absolute -top-2 -right-2 animate-sparkle" />
                <Sparkles className="w-6 h-6 text-gold absolute -bottom-1 -left-1 animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-4xl font-display font-bold text-gradient-luck">Números Reservados!</h1>
                <p className="text-xl text-gold font-medium">Boa sorte! 🎰</p>
              </div>
              
              <p className="text-muted-foreground">
                Seus números da sorte foram reservados. Após a confirmação do pagamento, você receberá um e-mail de confirmação.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => setStep('hero')} 
                  className="btn-luck text-primary-foreground font-bold"
                >
                  <span className="mr-2">🍀</span>
                  Voltar ao início
                </Button>
                <Link to="/meus-numeros">
                  <Button variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/10 w-full">
                    Ver meus números
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
