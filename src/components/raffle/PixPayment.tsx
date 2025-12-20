import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { Copy, Check, Clock, QrCode, AlertCircle, Sparkles, Star, Coins, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />
      
      <CardHeader className="text-center space-y-2 pt-8 relative">
        {/* Corner decorations */}
        <div className="absolute top-4 left-4 text-gold/20">
          <Coins className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20">
          <Star className="w-6 h-6" />
        </div>
        
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald to-gold flex items-center justify-center mb-2 glow-emerald animate-pulse-glow">
          <QrCode className="w-8 h-8 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl font-display text-gradient-luck">Pagamento PIX</CardTitle>
        <CardDescription>
          Copie a chave PIX e realize o pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-warning/10 border border-warning/30">
          <Clock className="w-5 h-5 text-warning animate-pulse" />
          <span className="text-sm">
            Tempo para pagamento: <span className="font-bold text-warning text-lg">{timeLeft}</span>
          </span>
        </div>

        {/* Amount */}
        <div className="text-center p-6 rounded-xl bg-gradient-to-br from-gold/10 via-purple/5 to-emerald/10 border border-gold/30 relative overflow-hidden">
          <div className="absolute top-2 right-2 text-gold/20">
            <Zap className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground mb-1 flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-gold" />
            Valor a pagar
          </p>
          <p className="text-4xl font-display font-bold text-gradient-gold">{formatCurrency(amount)}</p>
        </div>

        {/* PIX Key */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Chave PIX ({getPixKeyTypeLabel(pixKeyType)})
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-xl card-casino border border-border font-mono text-sm break-all">
              {pixKey}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPixKey}
              className="shrink-0 border-gold/30 hover:bg-gold/10 hover:border-gold h-12 w-12"
            >
              {copied ? (
                <Check className="w-5 h-5 text-success" />
              ) : (
                <Copy className="w-5 h-5 text-gold" />
              )}
            </Button>
          </div>
        </div>

        {/* Beneficiary */}
        <div className="p-4 rounded-xl card-casino border border-border">
          <p className="text-sm text-muted-foreground">Favorecido</p>
          <p className="font-medium text-foreground">{beneficiaryName}</p>
        </div>

        {/* Purchase ID */}
        <div className="p-4 rounded-xl card-casino border border-border">
          <p className="text-sm text-muted-foreground">Código da compra</p>
          <p className="font-mono text-sm text-emerald font-bold">{purchaseId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 p-5 rounded-xl card-casino border border-emerald/20">
          <p className="font-medium flex items-center gap-2 text-foreground">
            <AlertCircle className="w-4 h-4 text-gold" />
            Instruções
          </p>
          <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
            <li>Copie a chave PIX acima</li>
            <li>Abra o aplicativo do seu banco</li>
            <li>Faça um PIX usando a chave copiada</li>
            <li>Use o valor <span className="text-gold font-medium">{formatCurrency(amount)}</span></li>
            <li>Aguarde a confirmação por e-mail</li>
          </ol>
        </div>

        {/* Note */}
        <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald" />
          Após a confirmação do pagamento, você receberá um e-mail para escolher seus números.
          <Sparkles className="w-3 h-3 text-emerald" />
        </p>
      </CardContent>
    </Card>
  );
}