import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { buyerSchema, type BuyerFormData, formatCurrency } from '@/lib/validators';
import { User, Mail, Phone, Hash, ArrowRight, Sparkles, Star, Coins, Zap } from 'lucide-react';

interface BuyerFormProps {
  pricePerNumber: number;
  maxNumbers: number;
  onSubmit: (data: BuyerFormData & { quantity: number }) => void;
  isLoading?: boolean;
}

export function BuyerForm({ pricePerNumber, maxNumbers, onSubmit, isLoading }: BuyerFormProps) {
  const [quantity, setQuantity] = useState(10);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BuyerFormData>({
    resolver: zodResolver(buyerSchema),
  });

  const totalAmount = quantity * pricePerNumber;

  const handleFormSubmit = (data: BuyerFormData) => {
    onSubmit({ ...data, quantity });
  };

  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden">
      {/* Decorative header bar */}
      <div className="h-2 bg-gradient-luck" />

      <CardHeader className="text-center space-y-2 sm:space-y-3 pt-6 sm:pt-8 px-4 sm:px-6 relative">
        {/* Corner decorations - hidden on small screens */}
        <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
          <Star className="w-6 h-6" />
        </div>
        <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
          <Sparkles className="w-6 h-6" />
        </div>

        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-luck flex items-center justify-center mb-2 glow-emerald animate-pulse-glow">
          <span className="text-2xl sm:text-3xl">🍀</span>
        </div>
        <CardTitle className="text-2xl sm:text-3xl font-display text-gradient-luck">Seus Dados</CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Preencha seus dados para tentar a sorte! ✨
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-6 sm:pb-8 px-4 sm:px-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-emerald" />
              Nome completo <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Seu nome completo"
              {...register('name')}
              className={`input-casino ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-emerald" />
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={`input-casino ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-emerald" />
              Telefone (WhatsApp) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              className={`input-casino ${errors.phone ? 'border-destructive' : ''}`}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2 text-foreground">
              <Hash className="w-4 h-4 text-gold" />
              Quantidade de números da sorte
            </Label>

            {/* Presets - Attractive Bundles */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* 1: Sortudo */}
              <button
                type="button"
                onClick={() => setQuantity(1)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 1
                  ? 'border-emerald bg-emerald/10 glow-emerald'
                  : 'border-border/50 hover:border-emerald/50 bg-card/50'
                  }`}
              >
                <p className="font-bold text-lg text-foreground">1</p>
                <p className="text-[9px] text-muted-foreground uppercase">Sortudo</p>
              </button>

              {/* 5: Esperança */}
              <button
                type="button"
                onClick={() => setQuantity(5)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 5
                  ? 'border-emerald bg-emerald/10 glow-emerald'
                  : 'border-border/50 hover:border-emerald/50 bg-card/50'
                  }`}
              >
                <p className="font-bold text-lg text-foreground">5</p>
                <p className="text-[9px] text-muted-foreground uppercase">Top</p>
              </button>

              {/* 10: Popular */}
              <button
                type="button"
                onClick={() => setQuantity(10)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 10
                  ? 'border-emerald bg-emerald/10 glow-emerald'
                  : 'border-border/50 hover:border-emerald/50 bg-card/50'
                  }`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-emerald text-primary-foreground text-[7px] font-bold rounded-full uppercase whitespace-nowrap">
                  Pop
                </div>
                <p className="font-bold text-lg text-foreground">10</p>
                <p className="text-[9px] text-muted-foreground uppercase">Popular</p>
              </button>

              {/* 25: Confiante */}
              <button
                type="button"
                onClick={() => setQuantity(25)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 25
                  ? 'border-gold bg-gold/10 glow-gold'
                  : 'border-gold/30 hover:border-gold/60 bg-gold/5'
                  }`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-gold text-black text-[7px] font-bold rounded-full uppercase whitespace-nowrap">
                  Mais Vendido
                </div>
                <p className="font-bold text-lg text-gold mt-1">25</p>
                <p className="text-[9px] text-gold/80 uppercase font-semibold">Confiante</p>
              </button>

              {/* 50: Determinado */}
              <button
                type="button"
                onClick={() => setQuantity(50)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 50
                  ? 'border-gold bg-gold/10 glow-gold'
                  : 'border-gold/30 hover:border-gold/60 bg-gold/5'
                  }`}
              >
                <p className="font-bold text-lg text-gold">50</p>
                <p className="text-[9px] text-gold/80 uppercase font-semibold">VIP</p>
              </button>

              {/* 100: Magnata */}
              <button
                type="button"
                onClick={() => setQuantity(100)}
                className={`relative p-2 rounded-xl border-2 transition-all text-center ${quantity === 100
                  ? 'border-purple bg-purple/10 glow-purple'
                  : 'border-purple/30 hover:border-purple/60 bg-purple/5'
                  }`}
              >
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-purple text-white text-[7px] font-bold rounded-full uppercase whitespace-nowrap">
                  Melhor Valor
                </div>
                <p className="font-bold text-lg text-purple mt-1">100</p>
                <p className="text-[9px] text-purple/80 uppercase font-semibold">Magnata</p>
              </button>
            </div>

            {/* Slider */}
            <div className="space-y-3 pt-2">
              <Slider
                value={[quantity]}
                onValueChange={(value) => setQuantity(value[0])}
                min={1}
                max={Math.min(500, maxNumbers)}
                step={1}
                className="py-4"
                aria-label="Selecionar quantidade de números"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span className="text-emerald font-bold text-lg flex items-center gap-1">
                  <Star className="w-4 h-4 text-gold animate-sparkle" />
                  {quantity} números
                </span>
                <span>{Math.min(500, maxNumbers)}</span>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-gold/10 via-purple/5 to-emerald/10 border border-gold/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-gold/20 hidden sm:block">
              <Coins className="w-8 h-8" />
            </div>
            <div className="absolute bottom-2 left-2 text-purple/10 hidden sm:block">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold" />
                  Total a pagar
                </p>
                <p className="text-2xl sm:text-4xl font-display font-bold text-gradient-gold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs sm:text-sm text-emerald font-medium">{quantity}x números</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{formatCurrency(pricePerNumber)} cada</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="btn-luck w-full py-5 sm:py-7 text-base sm:text-lg text-primary-foreground font-bold uppercase tracking-wider"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                <span className="mr-2">🍀</span>
                <span className="hidden sm:inline">Continuar para Pagamento</span>
                <span className="sm:hidden">Continuar</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}