import { useState, memo } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  buyerSchema,
  type BuyerFormData,
  formatCurrency,
} from "@/lib/validators";
import {
  User,
  Mail,
  Phone,
  Hash,
  ArrowRight,
  Sparkles,
  Star,
  Coins,
  Zap,
} from "lucide-react";

interface BuyerFormProps {
  pricePerNumber: number;
  maxNumbers: number;
  onSubmit: (data: BuyerFormData & { quantity: number }) => void;
  isLoading?: boolean;
}

const BUNDLES = [
  { id: 1, label: "Sortudo", color: "emerald", value: 1, tag: null },
  { id: 2, label: "Top", color: "emerald", value: 5, tag: null },
  { id: 3, label: "Popular", color: "emerald", value: 10, tag: "Pop" },
  { id: 4, label: "Confiante", color: "gold", value: 25, tag: "Mais Vendido" },
  { id: 5, label: "VIP", color: "gold", value: 50, tag: null },
  { id: 6, label: "Magnata", color: "purple", value: 100, tag: "Melhor Valor" },
];

export const BuyerForm = memo(({
  pricePerNumber,
  maxNumbers,
  onSubmit,
  isLoading,
}: BuyerFormProps) => {
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

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
      <Card className="w-full max-w-lg mx-auto card-jackpot border-gold/20 overflow-hidden shadow-2xl">
        <div className="h-2 bg-gradient-luck" />

        <CardHeader className="text-center space-y-2 pt-6 sm:pt-8 px-4 sm:px-6 relative">
          <div className="absolute top-4 left-4 text-gold/20 hidden sm:block">
            <Star className="w-8 h-8 animate-float" />
          </div>
          <div className="absolute top-4 right-4 text-emerald/20 hidden sm:block">
            <Sparkles className="w-8 h-8 animate-float [animation-delay:2s]" />
          </div>

          <motion.div
            variants={itemVariants}
            className="mx-auto w-16 h-16 rounded-full bg-gradient-luck flex items-center justify-center mb-2 glow-emerald shadow-lg"
          >
            <span className="text-3xl animate-bounce">🍀</span>
          </motion.div>
          <motion.div variants={itemVariants}>
            <CardTitle className="text-3xl sm:text-4xl font-display text-gradient-luck drop-shadow-sm">
              Garantir Sorte
            </CardTitle>
            <CardDescription className="text-sm sm:text-base font-medium text-muted-foreground/80">
              Escolha seus pacotes e participe ✨
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="pb-8 px-4 sm:px-8">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    <User className="w-3.5 h-3.5 text-emerald" /> Seu Nome
                  </Label>
                  <Input
                    id="name"
                    autoComplete="name"
                    autoCapitalize="words"
                    placeholder="Nome Completo"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    {...register("name")}
                    className={`input-casino h-12 ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p
                      id="name-error"
                      role="alert"
                      className="text-[10px] text-destructive font-bold uppercase tracking-tight"
                    >
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald" /> WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      {...register("phone")}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, "");
                        if (value.length > 11) value = value.slice(0, 11);

                        if (value.length > 2) {
                          value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
                        }
                        if (value.length > 9) {
                          // (XX) XXXXX...
                          value = `${value.slice(0, 10)}-${value.slice(10)}`;
                        } else if (value.length > 5) {
                          // (XX) XXXX... (before 9th digit)
                          // value is already (XX) XXXX...
                        }

                        // Specific adjustment for standard mobile 11 digits: (XX) XXXXX-XXXX
                        // But we also want to support landlines just in case? Usually raffles focus on mobile/whatsapp.
                        // Let's stick to the standard mobile format logic improved:

                        const raw = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 11);
                        let formatted = raw;

                        if (raw.length > 0) {
                          formatted = raw.replace(/^(\d{2})(\d)/g, "($1) $2");
                          formatted = formatted.replace(
                            /(\d)(\d{4})$/,
                            "$1-$2",
                          );
                        }

                        e.target.value = formatted;
                        register("phone").onChange(e); // Propagate to react-hook-form
                      }}
                      aria-invalid={!!errors.phone}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={`input-casino h-12 ${errors.phone ? "border-destructive" : ""}`}
                    />
                    {errors.phone && (
                      <p
                        id="phone-error"
                        role="alert"
                        className="text-[10px] text-destructive font-bold uppercase tracking-tight"
                      >
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald" /> E-mail
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="exemplo@email.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      {...register("email")}
                      className={`input-casino h-12 ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p
                        id="email-error"
                        role="alert"
                        className="text-[10px] text-destructive font-bold uppercase tracking-tight"
                      >
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-5">
              <div className="flex items-center justify-between px-1">
                <Label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground">
                  <Hash className="w-4 h-4 text-gold fill-gold/20" /> Escolha
                  sua Cota
                </Label>
                <span className="text-[10px] text-muted-foreground font-mono bg-white/5 px-2 py-0.5 rounded-full">
                  ESTOQUE LIMITADO
                </span>
              </div>

              {/* Bundles Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5" role="group" aria-label="Selecione um pacote de cotas">
                {BUNDLES.map((bundle) => (
                  <motion.button
                    key={bundle.id}
                    type="button"
                    aria-label={`Selecionar pacote ${bundle.label} com ${bundle.value} cotas`}
                    aria-pressed={quantity === bundle.value}
                    whileHover={{ y: -4, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setQuantity(bundle.value)}
                    className={`relative p-2.5 rounded-2xl border-2 transition-all group overflow-hidden ${quantity === bundle.value
                      ? bundle.color === 'emerald' ? 'border-emerald bg-emerald/10 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                        bundle.color === 'gold' ? 'border-gold bg-gold/10 shadow-[0_0_20px_rgba(234,179,8,0.3)]' :
                          'border-purple bg-purple/10 shadow-[0_0_20px_rgba(168,85,247,0.3)]'
                      : 'border-border/30 hover:border-border bg-black/20 hover:bg-black/40'
                      }`}
                  >
                    {bundle.tag && (
                      <div
                        className={`absolute -top-0 left-0 right-0 py-0.5 text-[7px] font-black uppercase text-center ${
                          bundle.color === "gold"
                            ? "bg-gold text-black"
                            : bundle.color === "purple"
                              ? "bg-purple text-white"
                              : "bg-emerald text-white"
                        }`}
                      >
                        {bundle.tag}
                      </div>
                    )}
                    <div className="pt-2 pb-1">
                      <p
                        className={`text-xl font-black ${
                          quantity === bundle.value
                            ? "scale-110 transition-transform"
                            : "opacity-80"
                        } ${
                          bundle.color === "gold"
                            ? "text-gold"
                            : bundle.color === "purple"
                              ? "text-purple-light"
                              : "text-emerald-light"
                        }`}
                      >
                        {bundle.value}
                      </p>
                      <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
                        {bundle.label}
                      </p>
                    </div>
                    {quantity === bundle.value && (
                      <motion.div
                        layoutId="bundle-active"
                        className="absolute inset-0 border-2 border-inherit rounded-2xl animate-pulse-slow pointer-events-none"
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Slider */}
              <div className="space-y-4 pt-4 px-2">
                <Slider
                  value={[quantity]}
                  onValueChange={(value) => setQuantity(value[0])}
                  min={1}
                  max={Math.min(500, maxNumbers)}
                  step={1}
                  aria-label="Selecionar quantidade de cotas"
                  className="py-4 cursor-pointer"
                />
                <div className="flex justify-between items-center bg-black/30 p-3 rounded-2xl border border-white/5 shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald/10 flex items-center justify-center border border-emerald/20">
                      <span className="text-lg">💰</span>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                        Quantidade
                      </p>
                      <p className="text-sm font-black text-emerald-light">
                        {quantity} COTAS
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none">
                      Preço Unitário
                    </p>
                    <p className="text-sm font-black text-gold">
                      {formatCurrency(pricePerNumber)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Total Resumo */}
            <motion.div
              variants={itemVariants}
              className="relative group p-6 rounded-3xl bg-gradient-to-br from-gold/10 via-background to-emerald/10 border-2 border-gold/20 overflow-hidden shadow-xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Coins className="w-20 h-20 rotate-12" />
              </div>
              <div className="relative z-10 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-gold fill-gold/20" /> Total do
                    Investimento
                  </p>
                  <motion.p
                    key={totalAmount}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl sm:text-5xl font-display font-bold text-gradient-gold drop-shadow-md"
                  >
                    {formatCurrency(totalAmount)}
                  </motion.p>
                </div>
                <div className="h-12 w-12 rounded-full border-2 border-gold/40 flex items-center justify-center animate-shine overflow-hidden">
                  <span className="text-2xl">🪄</span>
                </div>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-luck w-full py-8 text-xl text-primary-foreground font-black uppercase tracking-thicker shadow-2xl group flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  "RESERVANDO..."
                ) : (
                  <>
                    <span className="group-hover:rotate-12 transition-transform">
                      🍀
                    </span>
                    CONCLUIR PARTICIPAÇÃO
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            </motion.div>

            <p className="text-[9px] text-center text-muted-foreground uppercase tracking-widest font-bold opacity-60">
              Processamento Seguro via PIX Oficial Banco Central
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
});

BuyerForm.displayName = 'BuyerForm';
