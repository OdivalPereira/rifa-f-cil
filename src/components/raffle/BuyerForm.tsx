import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { buyerSchema, type BuyerFormData, formatCurrency } from '@/lib/validators';
import { User, Mail, Phone, Hash, ArrowRight, Sparkles, Star, Coins } from 'lucide-react';

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

  // Presets rápidos de quantidade
  const quantityPresets = [5, 10, 20, 50, 100];

  return (
    <Card className="w-full max-w-lg mx-auto card-jackpot border-emerald/20 overflow-hidden">
      {/* Decorative header */}
      <div className="h-2 bg-gradient-luck" />
      
      <CardHeader className="text-center space-y-3 pt-8">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-luck flex items-center justify-center mb-2 glow-emerald animate-pulse-glow">
          <span className="text-3xl">🍀</span>
        </div>
        <CardTitle className="text-3xl font-display text-gradient-luck">Seus Dados</CardTitle>
        <CardDescription className="text-base">
          Preencha seus dados para tentar a sorte! ✨
        </CardDescription>
      </CardHeader>

      <CardContent className="pb-8">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-emerald" />
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name')}
              className={`bg-secondary/50 border-border focus:border-emerald focus:ring-emerald/20 ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-emerald" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={`bg-secondary/50 border-border focus:border-emerald focus:ring-emerald/20 ${errors.email ? 'border-destructive' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-emerald" />
              Telefone (WhatsApp)
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              className={`bg-secondary/50 border-border focus:border-emerald focus:ring-emerald/20 ${errors.phone ? 'border-destructive' : ''}`}
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

            {/* Presets */}
            <div className="flex flex-wrap gap-2">
              {quantityPresets.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={quantity === preset ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setQuantity(preset)}
                  className={quantity === preset 
                    ? 'bg-emerald hover:bg-emerald-light text-primary-foreground glow-emerald' 
                    : 'border-emerald/30 hover:border-emerald hover:bg-emerald/10'
                  }
                >
                  {preset}
                </Button>
              ))}
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
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span className="text-emerald font-bold text-lg flex items-center gap-1">
                  <Star className="w-4 h-4 text-gold" />
                  {quantity} números
                </span>
                <span>{Math.min(500, maxNumbers)}</span>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-5 rounded-xl bg-gradient-jackpot border border-gold/30 relative overflow-hidden">
            <div className="absolute top-2 right-2 text-gold/30">
              <Coins className="w-8 h-8" />
            </div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-gold" />
                  Total a pagar
                </p>
                <p className="text-4xl font-display font-bold text-gradient-gold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-emerald font-medium">{quantity}x números</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(pricePerNumber)} cada</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="btn-luck w-full py-7 text-lg text-primary-foreground font-bold uppercase tracking-wider"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
                <span className="mr-2">🍀</span>
                Continuar para Pagamento
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
