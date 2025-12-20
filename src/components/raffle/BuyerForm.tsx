import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { buyerSchema, type BuyerFormData, formatCurrency } from '@/lib/validators';
import { User, Mail, Phone, Hash, ArrowRight, Sparkles } from 'lucide-react';

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
    <Card className="w-full max-w-lg mx-auto border-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-2">
          <Sparkles className="w-6 h-6 text-gold" />
        </div>
        <CardTitle className="text-2xl font-display">Seus Dados</CardTitle>
        <CardDescription>
          Preencha seus dados para participar da rifa
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Nome completo
            </Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              {...register('name')}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              {...register('email')}
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              Telefone (WhatsApp)
            </Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              {...register('phone')}
              className={errors.phone ? 'border-destructive' : ''}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Quantidade */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-muted-foreground" />
              Quantidade de números
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
                  className={quantity === preset ? 'bg-gold hover:bg-gold/90 text-primary-foreground' : ''}
                >
                  {preset}
                </Button>
              ))}
            </div>

            {/* Slider */}
            <div className="space-y-2">
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
                <span className="text-gold font-semibold">{quantity} números</span>
                <span>{Math.min(500, maxNumbers)}</span>
              </div>
            </div>
          </div>

          {/* Resumo */}
          <div className="p-4 rounded-lg bg-secondary/50 border border-gold/10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total a pagar</p>
                <p className="text-3xl font-bold text-gold">{formatCurrency(totalAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{quantity}x números</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(pricePerNumber)} cada</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-6 text-lg bg-gradient-gold hover:opacity-90 text-primary-foreground shadow-gold transition-all duration-300"
          >
            {isLoading ? (
              'Processando...'
            ) : (
              <>
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
