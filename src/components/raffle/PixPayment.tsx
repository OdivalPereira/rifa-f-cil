import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatCurrency } from '@/lib/validators';
import {
  Copy, Check, Clock, AlertCircle, Sparkles, Star, Coins, Zap,
  Upload, ExternalLink, QrCode as QrCodeIcon, ArrowRight, Eye, Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseSuccessCelebration } from './PurchaseSuccessCelebration';
import { generatePixPayload } from '@/lib/pix';
import { Progress } from '@/components/ui/progress';

interface PixPaymentProps {
  amount: number;
  pixKey: string;
  pixKeyType: string;
  beneficiaryName: string;
  purchaseId: string;
  expiresAt: string;
  buyerPhone?: string;
  quantity?: number;
  raffleShortCode?: string;
}

const BANK_LINKS = [
  { name: 'Nubank', url: 'nubank://', color: 'bg-[#820AD1]', hover: 'hover:shadow-[#820AD1]/40' },
  { name: 'Itaú', url: 'itau://', color: 'bg-[#EC7000]', hover: 'hover:shadow-[#EC7000]/40' },
  { name: 'Bradesco', url: 'bradesco://', color: 'bg-[#CC092F]', hover: 'hover:shadow-[#CC092F]/40' },
  { name: 'BB', url: 'bb://', color: 'bg-[#FBF404] text-blue-900', hover: 'hover:shadow-[#FBF404]/40' },
  { name: 'Inter', url: 'inter://', color: 'bg-[#FF7A00]', hover: 'hover:shadow-[#FF7A00]/40' },
  { name: 'Santander', url: 'santander://', color: 'bg-[#EC0000]', hover: 'hover:shadow-[#EC0000]/40' },
];

function PaymentTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

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

  return <span className="font-mono font-bold text-warning text-xl">{timeLeft}</span>;
}

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'checking'>('idle');
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dev simulation state
  const [showSuccess, setShowSuccess] = useState(false);
  const [mockBuyerPhone, setMockBuyerPhone] = useState('11999999999');

  // Generate standardized description
  const purchaseShortId = useMemo(() => purchaseId.slice(0, 6).toUpperCase(), [purchaseId]);

  const pixDescription = useMemo(() =>
    `${raffleShortCode}|${buyerPhone.replace(/\D/g, '')}|${quantity}cotas|#${purchaseShortId}`,
    [raffleShortCode, buyerPhone, quantity, purchaseShortId]
  );

  // Generate REAL PIX Copy and Paste Payload
  const pixPayload = useMemo(() => generatePixPayload({
    key: pixKey,
    amount: amount,
    beneficiaryName: beneficiaryName || 'Organizador',
    description: pixDescription,
    txId: purchaseShortId
  }), [pixKey, amount, beneficiaryName, pixDescription, purchaseShortId]);

  const handleCopyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      toast({
        title: 'Copiado com sucesso!',
        description: 'Cole no seu app do banco para pagar.',
      });
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        description: 'Copie o código manualmente.',
        variant: 'destructive',
      });
    }
  };

  const handleCopyDescription = async () => {
    try {
      await navigator.clipboard.writeText(pixDescription);
      toast({
        title: 'Descrição copiada!',
        description: 'Use no campo de mensagem do PIX.',
      });
    } catch (err) {
      // Ignore copy error
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'Arquivo maior que 5MB', variant: 'destructive' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setReceiptPreview(reader.result as string);
    reader.readAsDataURL(file);

    handleUploadReceipt(file);
  };

  const handleUploadReceipt = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${purchaseId}.${fileExt}`;
      const filePath = `${fileName}`;

      setUploadProgress(40);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      setUploadProgress(70);

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('purchases')
        .update({
          receipt_url: publicUrl,
          receipt_uploaded_at: new Date().toISOString()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)
        .eq('id', purchaseId);

      if (dbError) throw dbError;

      setUploadProgress(100);
      setTimeout(() => {
        setUploadStatus('success');
        toast({
          title: 'Confirmado!',
          description: 'Seu comprovante foi enviado com sucesso.',
        });
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      toast({ title: 'Erro no envio', description: 'Não foi possível salvar o arquivo.', variant: 'destructive' });
      setReceiptPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const getPixKeyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      cpf: 'CPF', cnpj: 'CNPJ', email: 'E-mail', phone: 'Telefone', random: 'Aleatória',
    };
    return types[type] || type;
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  if (showSuccess) {
    return (
      <motion.div initial="hidden" animate="visible" variants={containerVariants} className="w-full max-w-lg mx-auto space-y-4">
        <PurchaseSuccessCelebration purchasedQuantity={quantity} buyerPhone={mockBuyerPhone} />
        <Button variant="outline" className="w-full" onClick={() => setShowSuccess(false)}>
          Voltar para Pagamento (Dev)
        </Button>
      </motion.div>
    );
  }

  // --- STATE: AGUARDANDO CONFIRMAÇÃO ---
  if (uploadStatus === 'success') {
    return (
      <AnimatePresence>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
          <Card className="w-full max-w-lg mx-auto card-jackpot border-emerald/20 overflow-hidden">
            <div className="h-2 bg-gradient-luck" />
            <CardHeader className="text-center pt-8 pb-4">
              <div className="relative mx-auto w-20 h-20 mb-4">
                <div className="absolute inset-0 bg-emerald/20 rounded-full animate-pulse-radar" />
                <div className="relative w-20 h-20 rounded-full bg-emerald/10 border-2 border-emerald/50 flex items-center justify-center glow-emerald">
                  <Check className="w-10 h-10 text-emerald animate-bounce" />
                </div>
              </div>
              <CardTitle className="text-3xl font-display text-gradient-luck">Quase lá!</CardTitle>
              <CardDescription className="text-base">
                Seu comprovante está em nossa mesa. 🍀
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6 pb-8">
              <div className="p-5 bg-card/50 backdrop-blur-sm border border-emerald/20 rounded-2xl shadow-inner-slot space-y-3">
                <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald" /> Status do Pedido
                </p>
                <div className="flex flex-col items-center gap-1">
                  <span className="font-display text-2xl text-emerald animate-pulse">ANALISANDO</span>
                  <span className="text-xs text-muted-foreground">Tempo estimado: ~2 minutos</span>
                </div>
              </div>

              {receiptPreview && (
                <div className="relative group overflow-hidden rounded-xl border border-border aspect-video max-w-[240px] mx-auto shadow-lg">
                  <img src={receiptPreview} alt="Comprovante" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-bold uppercase tracking-wider">Ver Original</span>
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4">
                <p className="text-xs text-muted-foreground text-balance">
                  Enquanto isso, que tal avisar os amigos e aumentar sua sorte?
                </p>
                <div className="flex flex-col items-center gap-3">
                  <Button variant="outline" className="w-full border-gold/30 hover:bg-gold/10 group h-12 rounded-xl" onClick={() => setUploadStatus('idle')}>
                    <Eye className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                    Ver dados do PIX novamente
                  </Button>
                </div>
              </div>

              <DevSimulationSection quantity={quantity} setMockBuyerPhone={setMockBuyerPhone} setShowSuccess={setShowSuccess} />
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    )
  }

  // --- STATE: PAGAMENTO ---
  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden shadow-2xl">
        <div className="h-2 bg-gradient-luck" />

        <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
          <motion.div variants={itemVariants} className="absolute top-4 left-4 text-gold/20 hidden sm:block">
            <Coins className="w-8 h-8 animate-float" />
          </motion.div>
          <motion.div variants={itemVariants} className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
            <Star className="w-8 h-8 animate-float [animation-delay:1.5s]" />
          </motion.div>

          <CardTitle className="text-2xl sm:text-3xl font-display text-gradient-luck drop-shadow-sm">Pagamento Seguro</CardTitle>
          <CardDescription className="text-sm font-medium text-muted-foreground/80">
            Sua sorte está a um passo de distância! 🚀
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-6 sm:pb-8 px-4 sm:px-6">
          {/* Timer e Valor */}
          <div className="grid grid-cols-2 gap-4">
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-warning/5 border border-warning/20 shadow-inner">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1 mb-1">
                <Clock className="w-3 h-3 text-warning" /> Expira em
              </span>
              <PaymentTimer expiresAt={expiresAt} />
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald/5 border border-gold/20 shadow-inner">
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3 text-gold" /> Total
              </span>
              <span className="font-display font-bold text-gradient-gold text-xl animate-pulse-glow">{formatCurrency(amount)}</span>
            </motion.div>
          </div>

          {/* QR Code Area */}
          <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
            <div className="relative group">
              {/* Scanner Effect */}
              <div className="absolute inset-0 bg-gold/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-5 bg-white rounded-3xl border-2 border-gold/30 shadow-[0_0_50px_-12px_rgba(234,179,8,0.3)] relative overflow-hidden">
                <div className="animate-scanner" />
                <QRCodeSVG
                  value={pixPayload}
                  size={180}
                  level="Q"
                  includeMargin={false}
                  className="w-full h-full relative z-0"
                />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-foreground flex items-center justify-center gap-2">
                <QrCodeIcon className="w-4 h-4 text-gold" /> ESCANEIE O QR CODE
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Use o aplicativo do seu banco</p>
            </div>
          </motion.div>

          {/* PIX Key Copy Paste */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-foreground flex items-center gap-2 uppercase tracking-wide">
                <Zap className="w-3 h-3 text-gold fill-gold" />
                PIX Copia e Cola
              </p>
              <span className="text-[10px] text-muted-foreground font-mono">{getPixKeyTypeLabel(pixKeyType)}</span>
            </div>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-luck rounded-2xl opacity-20 blur-sm group-hover:opacity-40 transition-opacity" />
              <div className="relative flex gap-2">
                <div className="flex-1 p-3.5 rounded-xl bg-card border border-border/50 font-mono text-xs break-all flex items-center shadow-inner overflow-hidden line-clamp-1 opacity-70">
                  {pixPayload.slice(0, 42)}...
                </div>
                <Button
                  variant="luck"
                  size="icon"
                  onClick={handleCopyPixKey}
                  className={`shrink-0 h-11 w-11 rounded-xl transition-all ${copied ? 'bg-emerald border-emerald' : ''}`}
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5 text-white" />}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Description Section */}
          <motion.div variants={itemVariants} className="group overflow-hidden rounded-2xl border border-dashed border-emerald/30 bg-emerald/5 hover:bg-emerald/10 transition-colors">
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-light uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-emerald-light" /> Identificação
                </span>
                <button onClick={handleCopyDescription} className="text-[10px] font-bold text-foreground bg-white/10 px-2 py-0.5 rounded-full hover:bg-white/20 transition-colors uppercase">Copiar</button>
              </div>
              <p className="font-mono text-xs text-emerald/80 break-all leading-tight">
                {pixDescription}
              </p>

            </div>
          </motion.div>

          {/* Bank Deep Links */}
          <motion.div variants={itemVariants} className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <div className="h-[1px] flex-1 bg-border/30" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap px-2">Abrir App:</p>
              <div className="h-[1px] flex-1 bg-border/30" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {BANK_LINKS.map((bank) => (
                <motion.a
                  key={bank.name}
                  href={bank.url}
                  whileHover={{ scale: 1.1, translateY: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-white transition-all shadow-sm ${bank.color} ${bank.hover} hover:shadow-lg`}
                >
                  <span className="text-[9px] font-black uppercase tracking-tighter truncate w-full text-center">{bank.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Receipt Upload */}
          <motion.div variants={itemVariants} className="pt-4 border-t border-border/30">
            <div className="flex flex-col gap-3">
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

              {isUploading ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-emerald font-bold animate-pulse">Enviando comprovante...</span>
                    <span className="text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5 bg-emerald/10" />
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-card hover:bg-emerald/10 text-emerald-light border-emerald/20 border-2 border-dashed h-12 rounded-xl group"
                  >
                    <Upload className="w-4 h-4 mr-2 group-hover:-translate-y-1 transition-transform" />
                    Enviar Comprovante
                  </Button>
                  {receiptPreview && (
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-emerald/50 group">
                      <img src={receiptPreview} className="h-full w-full object-cover" />
                      <button onClick={() => setReceiptPreview(null)} className="absolute inset-0 bg-destructive/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tighter italic">
                Opcional: O envio do comprovante acelera a reserva dos números.
              </p>
            </div>
          </motion.div>

          <DevSimulationSection quantity={quantity} setMockBuyerPhone={setMockBuyerPhone} setShowSuccess={setShowSuccess} />
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DevSimulationProps {
  quantity: number;
  setMockBuyerPhone: (phone: string) => void;
  setShowSuccess: (show: boolean) => void;
}

function DevSimulationSection({ quantity, setMockBuyerPhone, setShowSuccess }: DevSimulationProps) {
  return (
    <div className="mt-8 pt-4 border-t border-dashed border-border/30 text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity">
      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Apenas para Testes</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="secondary"
          size="sm"
          className="h-6 text-[9px] bg-emerald/10 border-emerald/20 hover:bg-emerald/20"
          onClick={() => { setMockBuyerPhone('11988887777'); setShowSuccess(true); }}
        >
          Simular Confirmação
        </Button>
      </div>
    </div>
  )
}
