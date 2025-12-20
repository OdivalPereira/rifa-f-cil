import { useState } from 'react';
import { RaffleHero } from '@/components/raffle/RaffleHero';
import { BuyerForm } from '@/components/raffle/BuyerForm';
import { PixPayment } from '@/components/raffle/PixPayment';
import { NumberSelector } from '@/components/raffle/NumberSelector';
import { useActiveRaffle, useSoldNumbers, useCreatePurchase, useReserveNumbers } from '@/hooks/useRaffle';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, Search } from 'lucide-react';
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
        title: 'Números reservados!',
        description: 'Aguarde a confirmação do pagamento.',
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background pattern-luxury">
        <Ticket className="w-16 h-16 text-gold/50 mb-4" />
        <h1 className="text-2xl font-display font-semibold mb-2">Nenhuma rifa ativa</h1>
        <p className="text-muted-foreground mb-6">Volte em breve para conferir novidades!</p>
        <Link to="/meus-numeros">
          <Button variant="outline" className="border-gold/30">
            <Search className="w-4 h-4 mr-2" />
            Consultar meus números
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="w-6 h-6 text-gold" />
            <span className="font-display font-semibold text-lg">Rifas Premium</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/meus-numeros">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Meus Números
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="border-gold/30">
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
          <div className="min-h-screen flex items-center justify-center p-4 pattern-luxury">
            <BuyerForm
              pricePerNumber={Number(raffle.price_per_number)}
              maxNumbers={raffle.total_numbers - soldNumbers.length}
              onSubmit={handleBuyerSubmit}
              isLoading={createPurchase.isPending}
            />
          </div>
        )}

        {step === 'payment' && purchaseData && raffle.pix_key && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-luxury">
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
                <Button variant="outline" onClick={() => setStep('numbers')}>
                  Já paguei - Escolher meus números
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'numbers' && purchaseData && (
          <div className="min-h-screen flex items-center justify-center p-4 pattern-luxury">
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
          <div className="min-h-screen flex items-center justify-center p-4 pattern-luxury">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <Ticket className="w-10 h-10 text-success" />
              </div>
              <h1 className="text-3xl font-display font-bold">Números Reservados!</h1>
              <p className="text-muted-foreground">
                Seus números foram reservados. Após a confirmação do pagamento pelo administrador, você receberá um e-mail de confirmação.
              </p>
              <Button onClick={() => setStep('hero')} className="bg-gradient-gold text-primary-foreground">
                Voltar ao início
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
