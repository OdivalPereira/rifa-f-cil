import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Mail, Clover, Sparkles, Star } from 'lucide-react';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';
import { supabase } from '@/integrations/supabase/client';

const authSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type AuthFormData = z.infer<typeof authSchema>;

export default function AdminAuth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  // Redirect if already logged in and is admin
  if (!isLoading && user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const onSubmit = async (data: AuthFormData) => {
    setIsSubmitting(true);

    try {
      // 1. Attempt login
      const { error } = await signIn(data.email, data.password);

      if (error) {
        toast({
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos'
            : error.message,
          variant: 'destructive',
        });
        return;
      }

      // 2. Immediate Admin Role Check
      // Query database directly to bypass any async state delay
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
         throw new Error("No user found after login");
      }

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) {
        toast({ title: 'Login realizado com sucesso!' });
        navigate('/admin', { replace: true });
      } else {
        // Not an admin - prevent access
        await signOut();
        toast({
          title: 'Acesso Negado',
          description: 'Este usuário não possui privilégios de administrador.',
          variant: 'destructive',
        });
      }

    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro inesperado',
        description: 'Ocorreu um erro ao processar seu login.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SlotMachineFrame>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-gold" />
            <p className="text-gold/70 font-medium">Carregando...</p>
          </div>
        </div>
      </SlotMachineFrame>
    );
  }

  return (
    <SlotMachineFrame>
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Main card */}
        <div className="w-full max-w-md">
          {/* Decorative header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-gold animate-sparkle" />
              <Clover className="w-12 h-12 text-emerald clover-icon animate-pulse-slow" />
              <Sparkles className="w-6 h-6 text-gold animate-sparkle" style={{ animationDelay: '0.5s' }} />
            </div>
            <h1 className="text-3xl font-display text-gradient-gold mb-2">
              Área Administrativa
            </h1>
            <p className="text-muted-foreground">
              Entre com suas credenciais para acessar o painel
            </p>
          </div>

          {/* Login card */}
          <div className="card-jackpot p-6">
            {/* Card inner glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-gold/5 to-transparent pointer-events-none" />
            
            <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground/90">
                  <Mail className="w-4 h-4 text-gold" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@exemplo.com"
                  {...register('email')}
                  className={`input-casino h-12 ${errors.email ? 'border-destructive' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2 text-foreground/90">
                  <Lock className="w-4 h-4 text-gold" />
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`input-casino h-12 ${errors.password ? 'border-destructive' : ''}`}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full h-12 btn-gold text-lg font-bold rounded-lg"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Star className="w-5 h-5 mr-2" />
                    Entrar
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Back to home link */}
          <div className="text-center mt-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald transition-colors"
            >
              <Clover className="w-4 h-4" />
              Voltar para a página inicial
            </Link>
          </div>
        </div>
      </div>
    </SlotMachineFrame>
  );
}
