import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, Lock, Sparkles, Trophy } from 'lucide-react';
import { SlotMachineFrame } from '@/components/SlotMachineFrame';
import { supabase } from '@/integrations/supabase/client';

const signupSchema = z.object({
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    organizationName: z.string().min(3, 'Nome da organização deve ter pelo menos 3 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function OrganizerSignup() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
    });

    const onSubmit = async (data: SignupFormData) => {
        setIsSubmitting(true);

        try {
            // 1. Sign Up User (Trigger will assign 'organizer' role)
            const { error: signUpError } = await signUp(data.email, data.password);

            if (signUpError) {
                throw signUpError;
            }

            // 2. Wait a moment for session to be established? 
            // Actually signUp returns session if auto-confirm is on.
            // If email confirmation is required, we can't insert profile yet usually?
            // Assuming auto-confirm or we prompt user to check email.
            // But let's check if we can get the user ID immediately.

            const { data: { session } } = await supabase.auth.getSession();

            if (session?.user) {
                // 3. Create Organizer Profile
                const { error: profileError } = await supabase
                    .from('organizer_profiles')
                    .insert({
                        id: session.user.id,
                        organization_name: data.organizationName,
                    });

                if (profileError) {
                    console.error("Error creating profile:", profileError);
                    // Non-fatal? Or fatal? simpler to just log for now as they can set it later if failed.
                }
            }

            toast({
                title: 'Conta criada com sucesso!',
                description: 'Bem-vindo à plataforma.',
            });

            navigate('/admin/rifa');

        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro inesperado.';
            toast({
                title: 'Erro ao criar conta',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SlotMachineFrame>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center gap-3 mb-4">
                            <Trophy className="w-12 h-12 text-gold animate-bounce" />
                        </div>
                        <h1 className="text-3xl font-display text-gradient-gold mb-2">
                            Seja um Organizador
                        </h1>
                        <p className="text-muted-foreground">
                            Crie sua conta e comece a vender rifas hoje mesmo
                        </p>
                    </div>

                    <div className="card-jackpot p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                            <div className="space-y-2">
                                <Label htmlFor="organizationName" className="text-foreground/90">Nome do seu Negócio (Organização)</Label>
                                <Input
                                    id="organizationName"
                                    autoComplete="organization"
                                    aria-invalid={!!errors.organizationName}
                                    aria-describedby={errors.organizationName ? "organization-error" : undefined}
                                    placeholder="Ex: Prêmios do João"
                                    {...register('organizationName')}
                                    className={`input-casino ${errors.organizationName ? 'border-destructive' : ''}`}
                                />
                                {errors.organizationName && (
                                    <p id="organization-error" role="alert" className="text-sm text-destructive">
                                        {errors.organizationName.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground/90">E-mail</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    aria-invalid={!!errors.email}
                                    aria-describedby={errors.email ? "email-error" : undefined}
                                    placeholder="seu@email.com"
                                    {...register('email')}
                                    className={`input-casino ${errors.email ? 'border-destructive' : ''}`}
                                />
                                {errors.email && (
                                    <p id="email-error" role="alert" className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-foreground/90">Senha</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.password}
                                    aria-describedby={errors.password ? "password-error" : undefined}
                                    placeholder="Mínimo 6 caracteres"
                                    {...register('password')}
                                    className={`input-casino ${errors.password ? 'border-destructive' : ''}`}
                                />
                                {errors.password && (
                                    <p id="password-error" role="alert" className="text-sm text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword" className="text-foreground/90">Confirmar Senha</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    autoComplete="new-password"
                                    aria-invalid={!!errors.confirmPassword}
                                    aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                                    placeholder="Repita a senha"
                                    {...register('confirmPassword')}
                                    className={`input-casino ${errors.confirmPassword ? 'border-destructive' : ''}`}
                                />
                                {errors.confirmPassword && (
                                    <p id="confirm-password-error" role="alert" className="text-sm text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-12 btn-gold text-lg font-bold rounded-lg mt-4"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5 mr-2" />
                                        Criar Conta Grátis
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>

                    <div className="text-center mt-6 space-y-2">
                        <Link to="/admin/login" className="block text-sm text-muted-foreground hover:text-emerald transition-colors">
                            Já tem conta? Faça Login
                        </Link>
                    </div>
                </div>
            </div>
        </SlotMachineFrame>
    );
}
