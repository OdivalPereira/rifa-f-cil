import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clover, Phone, Lock, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { toast } from 'sonner';

export default function CustomerAccount() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, register, login } = useCustomerAuth();
  
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/meus-numeros');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Format phone as user types
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent, action: 'register' | 'login') => {
    e.preventDefault();
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      toast.error('Telefone inválido', { description: 'Digite um número de telefone válido' });
      return;
    }

    if (pin.length !== 4) {
      toast.error('PIN inválido', { description: 'Digite um PIN de 4 dígitos' });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = action === 'register' 
        ? await register(cleanPhone, pin)
        : await login(cleanPhone, pin);

      if (result.success) {
        toast.success(action === 'register' ? 'Conta criada!' : 'Bem-vindo!', {
          description: 'Redirecionando...'
        });
        navigate('/meus-numeros');
      } else {
        toast.error('Erro', { description: result.error });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex items-center justify-center">
          <Clover className="w-10 h-10 animate-spin text-gold" />
        </div>
      </SlotMachineFrame>
    );
  }

  return (
    <SlotMachineFrame>
      <div className="min-h-screen">
        {/* Header */}
        <header className="relative z-10 border-b border-gold/20 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center gap-2 sm:gap-4">
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-gold/10 hover:text-gold h-9 w-9 sm:h-10 sm:w-10"
                aria-label="Voltar para início"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Clover className="w-5 h-5 sm:w-6 sm:h-6 text-emerald clover-icon" />
              <span className="font-display font-semibold text-base sm:text-lg text-gradient-gold">Minha Conta</span>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-md">
          <div className="card-jackpot p-5 sm:p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-gold animate-sparkle" />
                <Lock className="w-7 h-7 text-gold" />
                <Sparkles className="w-5 h-5 text-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
              </div>
              <h1 className="text-xl sm:text-2xl font-display text-gradient-gold">Acesse seus Números</h1>
              <p className="text-muted-foreground mt-2 text-sm">Entre ou crie uma conta com seu telefone</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-emerald data-[state=active]:text-primary-foreground"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="data-[state=active]:bg-emerald data-[state=active]:text-primary-foreground"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Criar Conta
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, 'login')} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" />
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="input-casino h-12"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gold" />
                      PIN (4 dígitos)
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={pin}
                        onChange={setPin}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-gold/30" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-luck py-6 text-lg font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Clover className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <LogIn className="w-5 h-5 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={(e) => handleSubmit(e, 'register')} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gold" />
                      Telefone
                    </label>
                    <Input
                      type="tel"
                      inputMode="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="input-casino h-12"
                      maxLength={15}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gold" />
                      Crie um PIN (4 dígitos)
                    </label>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={4}
                        value={pin}
                        onChange={setPin}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={1} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={2} className="w-12 h-14 text-xl font-bold border-gold/30" />
                          <InputOTPSlot index={3} className="w-12 h-14 text-xl font-bold border-gold/30" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Use este PIN para acessar seus números
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full btn-luck py-6 text-lg font-bold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Clover className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-5 h-5 mr-2" />
                        Criar Conta
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Info */}
            <div className="mt-6 pt-6 border-t border-border/30">
              <p className="text-xs text-muted-foreground text-center">
                Use o mesmo telefone que você usou para comprar os números da rifa.
              </p>
            </div>
          </div>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </main>
      </div>
    </SlotMachineFrame>
  );
}
