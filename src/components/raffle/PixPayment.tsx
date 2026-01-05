import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import { Copy, Check, Clock, AlertCircle, Sparkles, Star, Coins, Zap, Upload, ExternalLink, QrCode as QrCodeIcon, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseSuccessCelebration } from './PurchaseSuccessCelebration';

interface PixPaymentProps {
  amount: number;
  pixKey: string;
  pixKeyType: string;
  beneficiaryName: string;
  purchaseId: string;
  expiresAt: string;
  buyerPhone?: string; // New prop for description
  quantity?: number;   // New prop for description
  raffleShortCode?: string; // New prop for description
}

const BANK_LINKS = [
  { name: 'Nubank', url: 'nubank://', color: 'bg-[#820AD1] hover:bg-[#820AD1]/90' },
  { name: 'Itaú', url: 'itau://', color: 'bg-[#EC7000] hover:bg-[#EC7000]/90' },
  { name: 'Bradesco', url: 'bradesco://', color: 'bg-[#CC092F] hover:bg-[#CC092F]/90' },
  { name: 'BB', url: 'bb://', color: 'bg-[#FBF404] text-blue-900 hover:bg-[#FBF404]/90' },
  { name: 'Inter', url: 'inter://', color: 'bg-[#FF7A00] hover:bg-[#FF7A00]/90' },
  { name: 'Santander', url: 'santander://', color: 'bg-[#EC0000] hover:bg-[#EC0000]/90' },
];

export function PixPayment({
  amount,
  pixKey,
  pixKeyType,
  beneficiaryName,
  purchaseId,
  expiresAt,
  buyerPhone = '',
  quantity = 1,
  raffleShortCode = 'RIFA',
}: PixPaymentProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'checking'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dev simulation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [mockBuyerPhone, setMockBuyerPhone] = useState('11999999999');

  // Generate standardized description
  // Format: PREF|PHONE|QTD|#ID
  const purchaseShortId = purchaseId.slice(0, 6).toUpperCase();
  const pixDescription = `${raffleShortCode}|${buyerPhone.replace(/\D/g, '')}|${quantity}cotas|#${purchaseShortId}`;

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

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(pixDescription);
      toast({
        title: 'Descrição copiada!',
        description: 'Cole no campo de mensagem/descrição do PIX.',
      });
    } catch {
      // Fallback or ignore
    }
  };

  const handleUploadReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: 'Arquivo muito grande',
        description: 'O comprovante deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${purchaseId}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      // Update purchase record
      const { error: dbError } = await supabase
        .from('purchases')
        .update({
          receipt_url: publicUrl,
          receipt_uploaded_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (dbError) throw dbError;

      setUploadStatus('success');
      toast({
        title: 'Comprovante enviado!',
        description: 'Iremos verificar seu pagamento em breve.',
      });

    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Erro no envio',
        description: 'Não foi possível enviar o comprovante. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
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
          purchasedQuantity={quantity}
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

  // --- STATE: AGUARDANDO CONFIRMAÇÃO ---
  if (uploadStatus === 'success' || uploadStatus === 'checking') {
    return (
      <Card className="w-full max-w-lg mx-auto card-jackpot border-emerald/20 overflow-hidden">
        <div className="h-2 bg-gradient-luck" />
        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mb-4 glow-emerald animate-pulse">
            <Check className="w-8 h-8 text-emerald" />
          </div>
          <CardTitle className="text-2xl font-display text-gradient-luck">Comprovante Enviado!</CardTitle>
          <CardDescription>
            Estamos verificando seu pagamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6 pb-8">
          <div className="p-4 bg-muted/20 rounded-xl space-y-2">
            <p className="text-muted-foreground text-sm">Status Atual</p>
            <p className="font-bold text-lg text-emerald flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 animate-pulse" />
              Em análise
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Isso geralmente leva alguns minutos. Você receberá a confirmação por e-mail/WhatsApp.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full border-gold/30 hover:bg-gold/10"
              onClick={() => setUploadStatus('idle')} // Voltar para ver dados
            >
              Ver dados de pagamento novamente
            </Button>
          </div>

          <DevSimulationSection
            quantity={quantity}
            setMockBuyerPhone={setMockBuyerPhone}
            setShowSuccess={setShowSuccess}
          />
        </CardContent>
      </Card>
    )
  }

  // --- STATE: PAGAMENTO ---
  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />

      <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
        <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
          <Coins className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
          <Star className="w-6 h-6" />
        </div>

        <CardTitle className="text-xl sm:text-2xl font-display text-gradient-luck">Realizar Pagamento</CardTitle>
        <CardDescription className="text-sm">
          Falta pouco para garantir sua sorte!
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pb-6 sm:pb-8 px-4 sm:px-6">
        {/* Timer e Valor */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-warning/10 border border-warning/30">
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Expira em
            </span>
            <span className="font-mono font-bold text-warning text-lg">{timeLeft}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-br from-gold/10 via-purple/5 to-emerald/10 border border-gold/30">
            <span className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-gold" /> Valor
            </span>
            <span className="font-display font-bold text-gradient-gold text-lg">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* QR Code Area */}
        <div className="flex flex-col items-center space-y-3">
          <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-gold/40 shadow-lg glow-gold animate-pulse-glow hover:scale-[1.02] transition-transform duration-300">
            <QRCodeSVG
              value={pixKey} // In a real scenario with backend, this would be the BRCode payload
              size={180}
              level="M"
              includeMargin={true}
              className="w-full h-full"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-[200px]">
            Escaneie o QR Code com o app do seu banco
          </p>
        </div>

        {/* PIX Key Copy Paste */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-foreground font-medium flex items-center gap-1">
              <Zap className="w-3 h-3 text-gold" />
              Chave PIX ({getPixKeyTypeLabel(pixKeyType)})
            </p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 p-2 sm:p-3 rounded-xl card-casino border border-border font-mono text-xs sm:text-sm break-all flex items-center">
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

        {/* Description Section */}
        <div className="bg-muted/30 p-3 rounded-xl border border-dashed border-muted-foreground/30 space-y-2">
          <p className="text-xs font-medium text-foreground flex items-center justify-between">
            <span>💡 Adicione na descrição (Opcional)</span>
            <button onClick={handleCopyDescription} className="text-[10px] text-emerald hover:underline">Copiar</button>
          </p>
          <p className="font-mono text-xs text-muted-foreground break-all bg-background/50 p-2 rounded border border-border/50">
            {pixDescription}
          </p>
          <p className="text-[10px] text-muted-foreground">
            Ajuda a identificar seu pagamento mais rápido.
          </p>
        </div>

        {/* Bank Deep Links */}
        <div className="space-y-2">
          <p className="text-xs text-center text-muted-foreground">Abrir app do banco:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {BANK_LINKS.map((bank) => (
              <a key={bank.name} href={bank.url} target="_blank" rel="noopener noreferrer">
                <span className={`px-2 py-1 rounded text-[10px] sm:text-xs font-bold text-white transition-opacity ${bank.color}`}>
                  {bank.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Receipt Upload */}
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium mb-3 text-center">Já fez o pagamento?</p>

          <div className="grid grid-cols-1 gap-3">
            <input
              type="file"
              accept="image/*,application/pdf"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUploadReceipt}
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full bg-emerald/10 hover:bg-emerald/20 text-emerald border-emerald/50 border-2 border-dashed"
            >
              {isUploading ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isUploading ? 'Enviando...' : 'Enviar Comprovante (Opcional)'}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
              O envio do comprovante agiliza a liberação dos seus números.
            </p>
          </div>
        </div>

        <DevSimulationSection
          quantity={quantity}
          setMockBuyerPhone={setMockBuyerPhone}
          setShowSuccess={setShowSuccess}
        />
      </CardContent>
    </Card>
  );
}

function DevSimulationSection({ quantity, setMockBuyerPhone, setShowSuccess }: any) {
  return (
    <div className="mt-8 pt-4 border-t border-dashed border-emerald/30 text-center space-y-2 opacity-50 hover:opacity-100 transition-opacity">
      <p className="text-[10px] text-emerald font-bold uppercase tracking-wider">Simulação (Dev Only)</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 text-[10px]"
          onClick={() => { setMockBuyerPhone('11988887777'); setShowSuccess(true); }}
        >
          Simular Sucesso
        </Button>
      </div>
    </div>
  )
}