import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { Copy, Check, Clock, QrCode, AlertCircle } from 'lucide-react';
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
    <Card className="w-full max-w-lg mx-auto border-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mb-2">
          <QrCode className="w-8 h-8 text-gold" />
        </div>
        <CardTitle className="text-2xl font-display">Pagamento PIX</CardTitle>
        <CardDescription>
          Copie a chave PIX e realize o pagamento
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <Clock className="w-5 h-5 text-warning" />
          <span className="text-sm">
            Tempo para pagamento: <span className="font-bold text-warning">{timeLeft}</span>
          </span>
        </div>

        {/* Amount */}
        <div className="text-center p-6 rounded-xl bg-secondary/50 border border-gold/10">
          <p className="text-sm text-muted-foreground mb-1">Valor a pagar</p>
          <p className="text-4xl font-bold text-gold">{formatCurrency(amount)}</p>
        </div>

        {/* PIX Key */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Chave PIX ({getPixKeyTypeLabel(pixKeyType)})
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-3 rounded-lg bg-secondary/50 border border-border font-mono text-sm break-all">
              {pixKey}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyPixKey}
              className="shrink-0 border-gold/30 hover:bg-gold/10"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Beneficiary */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <p className="text-sm text-muted-foreground">Favorecido</p>
          <p className="font-medium">{beneficiaryName}</p>
        </div>

        {/* Purchase ID */}
        <div className="p-3 rounded-lg bg-secondary/30">
          <p className="text-sm text-muted-foreground">Código da compra</p>
          <p className="font-mono text-sm">{purchaseId.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Instructions */}
        <div className="space-y-3 p-4 rounded-lg bg-secondary/30 border border-border">
          <p className="font-medium flex items-center gap-2">
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
        <p className="text-xs text-center text-muted-foreground">
          Após a confirmação do pagamento, você receberá um e-mail para escolher seus números.
        </p>
      </CardContent>
    </Card>
  );
}
