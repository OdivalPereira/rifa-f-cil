import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { Copy, Check, Clock, QrCode, AlertCircle, Sparkles, Star, Coins, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PurchaseSuccessCelebration } from './PurchaseSuccessCelebration';

interface PixPaymentProps {
  amount: number;
  pixKey: string;
  pixKeyType: string;
  beneficiaryName: string;
  purchaseId: string;
  expiresAt: string;
  onConfirmed?: () => void;
}

export function PixPayment({
  amount,
  pixKey,
  pixKeyType,
  beneficiaryName,
  purchaseId,
  expiresAt,
}: PixPaymentProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Dev simulation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [mockBuyerPhone, setMockBuyerPhone] = useState('11999999999');

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const expires = new Date(expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expirado');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const handleCopyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      toast({
        title: 'Chave PIX copiada!',
        description: 'Cole no seu aplicativo de pagamento.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie a chave manualmente.',
        variant: 'destructive',
      });
    }
  };

  const getPixKeyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'E-mail',
      phone: 'Telefone',
      random: 'Chave Aleatória',
    };
    return types[type] || type;
  };

  if (showSuccess) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-4">
        <PurchaseSuccessCelebration 
          purchasedQuantity={5} 
          buyerPhone={mockBuyerPhone} 
        />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowSuccess(false)}
        >
          Voltar para Pagamento (Dev)
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />
      
      <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
        {/* Corner decorations - hidden on mobile */}
        <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
          <Coins className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
          <Star className="w-6 h-6" />
        </div>
        
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center mb-2 glow-emerald animate-pulse-glow">
          <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-display text-gradient-luck">Pagamento PIX</CardTitle>
        <CardDescription className="text-sm">
          Copie a chave PIX e realize o pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2 p-3 sm:p-4 rounded-xl bg-warning/10 border border-warning/30">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-warning animate-pulse" />
          <span className="text-xs sm:text-sm">
            Tempo: <span className="font-bold text-warning text-base sm:text-lg">{timeLeft}</span>
          </span>
        </div>

        {/* Amount */}
        <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gold/10 via-purple/5 to-emerald/10 border border-gold/30 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-gold/20 hidden sm:block">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-gold" />
            Valor a pagar
          </p>
          <p className="text-3xl sm:text-4xl font-display font-bold text-gradient-gold">{formatCurrency(amount)}</p>
        </div>

        {/* PIX Key */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Chave PIX ({getPixKeyTypeLabel(pixKeyType)})
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 sm:p-3 rounded-xl card-casino border border-border font-mono text-xs sm:text-sm break-all">
              {pixKey}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPixKey}
              className="shrink-0 border-gold/30 hover:bg-gold/10 hover:border-gold h-10 w-10 sm:h-12 sm:w-12"
            >
              {copied ? (
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
              ) : (
                <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />
              )}
            </Button>
          </div>
        </div>

        {/* Beneficiary */}
        <div className="p-3 sm:p-4 rounded-xl card-casino border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">Favorecido</p>
          <p className="font-medium text-foreground text-sm sm:text-base">{beneficiaryName}</p>
        </div>

        {/* Purchase ID */}
        <div className="p-3 sm:p-4 rounded-xl card-casino border border-border">
          <p className="text-xs sm:text-sm text-muted-foreground">Código da compra</p>
          <p className="font-mono text-xs sm:text-sm text-emerald font-bold">{purchaseId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-2 sm:space-y-3 p-3 sm:p-5 rounded-xl card-casino border border-emerald/20">
          <p className="font-medium flex items-center gap-2 text-foreground text-sm sm:text-base">
            <AlertCircle className="w-4 h-4 text-gold" />
            Instruções
          </p>
          <ol className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2 list-decimal list-inside">
            <li>Copie a chave PIX acima</li>
            <li>Abra o aplicativo do seu banco</li>
            <li>Faça um PIX usando a chave copiada</li>
            <li>Use o valor <span className="text-gold font-medium">{formatCurrency(amount)}</span></li>
            <li>Aguarde a confirmação por e-mail</li>
          </ol>
        </div>

        {/* Note */}
        <p className="text-[10px] sm:text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-emerald" />
          Após a confirmação, você receberá um e-mail para escolher seus números.
          <Sparkles className="w-2 h-2 sm:w-3 sm:h-3 text-emerald" />
        </p>

        {/* Dev Simulation Area */}
        <div className="mt-6 p-4 border border-dashed border-emerald/30 rounded-lg bg-emerald/5 text-center space-y-2">
          <p className="text-xs text-emerald font-bold uppercase tracking-wider">Simulação (Dev Only)</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="secondary"
              size="sm"
              className="bg-emerald/20 hover:bg-emerald/30 text-emerald-100 border border-emerald/30"
              onClick={() => { setMockBuyerPhone('11988887777'); setShowSuccess(true); }}
            >
              Simular Sucesso (Novo Usuário)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="bg-gold/20 hover:bg-gold/30 text-gold-100 border border-gold/30"
              onClick={() => { setMockBuyerPhone('11999999999'); setShowSuccess(true); }}
            >
              Simular Sucesso (Usuário Existente)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}