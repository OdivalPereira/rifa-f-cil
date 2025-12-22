import { useState } from 'react';
import { RaffleHero } from '@/components/raffle/RaffleHero';
import { BuyerForm } from '@/components/raffle/BuyerForm';
import { PixPayment } from '@/components/raffle/PixPayment';
import { NumberSelector } from '@/components/raffle/NumberSelector';
import { useActiveRaffle, useSoldNumbers, useCreatePurchase, useReserveNumbers } from '@/hooks/useRaffle';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Sparkles, Star, Clover } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';
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
      <SlotMachineFrame>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="relative">
              <Loader2 className="w-14 h-14 animate-spin text-gold mx-auto" />
              <Sparkles className="w-6 h-6 text-emerald absolute -top-2 -right-2 animate-sparkle" />
              <Star className="w-5 h-5 text-gold absolute -bottom-1 -left-1 animate-sparkle" style={{ animationDelay: '0.5s' }} />
            </div>
            <p className="text-gold/80 font-medium">Carregando sua sorte...</p>
          </div>
        </div>
      </SlotMachineFrame>
    );
  }

  if (!raffle) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative inline-block">
              <Clover className="w-24 h-24 text-emerald/40 clover-icon animate-pulse-slow" />
              <Star className="w-8 h-8 text-gold absolute -top-2 -right-2 animate-sparkle" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gradient-gold">Nenhuma rifa ativa</h1>
            <p className="text-muted-foreground">Volte em breve para tentar a sorte! ✨</p>
            <Link to="/meus-numeros">
              <Button className="btn-gold">
                <Search className="w-4 h-4 mr-2" />
                Consultar meus números
              </Button>
            </Link>
          </div>
        </div>
      </SlotMachineFrame>
    );
  }

  return (
    <SlotMachineFrame showDecorations={step === 'hero' || step === 'success'}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-gold/20">
        <div className="container mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clover className="w-5 h-5 sm:w-6 sm:h-6 text-emerald clover-icon" />
            <span className="font-display font-bold text-base sm:text-lg text-gradient-gold">Rifa da Sorte</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link to="/meus-numeros">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold hover:bg-gold/10 px-2 sm:px-3">
                <Search className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Meus Números</span>
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-purple hover:bg-purple/10 px-2 sm:px-3">
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden text-xs">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div>
        {step === 'hero' && (
          <RaffleHero
            title={raffle.title}
            description={raffle.description}
            prizeDescription={raffle.prize_description}
            prizeDrawDetails={raffle.prize_draw_details}
            prizeTopBuyer={raffle.prize_top_buyer}
            prizeTopBuyerDetails={raffle.prize_top_buyer_details}
            prizeSecondTopBuyer={raffle.prize_second_top_buyer}
            prizeSecondTopBuyerDetails={raffle.prize_second_top_buyer_details}
            imageUrl={raffle.image_url}
            pricePerNumber={Number(raffle.price_per_number)}
            totalNumbers={raffle.total_numbers}
            soldNumbers={soldNumbers.length}
            drawDate={raffle.draw_date}
            onParticipate={handleParticipate}
          />
        )}

        {step === 'form' && (
          <div className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-3 sm:p-4">
            <BuyerForm
              pricePerNumber={Number(raffle.price_per_number)}
              maxNumbers={raffle.total_numbers - soldNumbers.length}
              onSubmit={handleBuyerSubmit}
              isLoading={createPurchase.isPending}
            />
          </div>
        )}

        {step === 'payment' && purchaseData && raffle.pix_key && (
          <div className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-3 sm:p-4">
            <div className="space-y-4 sm:space-y-6 w-full max-w-lg">
              <PixPayment
                amount={purchaseData.amount}
                pixKey={raffle.pix_key}
                pixKeyType={raffle.pix_key_type || 'random'}
                beneficiaryName={raffle.pix_beneficiary_name || 'Organizador'}
                purchaseId={purchaseData.id}
                expiresAt={purchaseData.expiresAt}
              />
              <div className="text-center px-4">
                <Button 
                  onClick={() => setStep('numbers')}
                  className="btn-luck text-primary-foreground font-bold w-full sm:w-auto text-sm sm:text-base py-4 sm:py-5"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Já paguei - Escolher meus números</span>
                  <span className="sm:hidden">Já paguei - Escolher números</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 'numbers' && purchaseData && (
          <div className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-2 sm:p-4">
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
          <div className="min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
            <div className="text-center space-y-6 sm:space-y-8 max-w-md">
              {/* Animated success icon */}
              <div className="relative inline-block">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center mx-auto glow-emerald animate-pulse-glow">
                  <Clover className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" />
                </div>
                <Star className="w-8 h-8 sm:w-10 sm:h-10 text-gold absolute -top-2 -right-2 animate-sparkle" />
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-gold absolute -bottom-1 -left-1 animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                <h1 className="text-2xl sm:text-4xl font-display font-bold text-gradient-gold">Números Reservados!</h1>
                <p className="text-lg sm:text-xl text-emerald font-medium">Boa sorte no sorteio! 🎰</p>
              </div>
              
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                Seus números da sorte foram reservados. Após a confirmação do pagamento, você receberá um e-mail de confirmação.
              </p>
              
              <div className="flex flex-col gap-3 justify-center px-4">
                <Button 
                  onClick={() => setStep('hero')} 
                  className="btn-luck text-primary-foreground font-bold w-full"
                >
                  <Clover className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Voltar ao início
                </Button>
                <Link to="/meus-numeros" className="w-full">
                  <Button variant="outline" className="border-gold/30 hover:border-gold hover:bg-gold/10 w-full">
                    <Star className="w-4 h-4 mr-2 text-gold" />
                    Ver meus números
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </SlotMachineFrame>
  );
}
