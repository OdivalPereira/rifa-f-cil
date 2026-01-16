import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Building } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const profileSchema = z.object({
    organization_name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
    support_phone: z.string().optional(),
    support_email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    logo_url: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function OrganizerSettings() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: profile, isLoading } = useQuery({
        queryKey: ['organizer-profile'],
        queryFn: async () => {
            if (!user) return null;
            const { data, error } = await supabase
                .from('organizer_profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            return data;
        },
        enabled: !!user,
    });

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
    });

    useEffect(() => {
        if (profile) {
            reset({
                organization_name: profile.organization_name,
                support_phone: profile.support_phone || '',
                support_email: profile.support_email || '',
                logo_url: profile.logo_url || '',
            });
        }
    }, [profile, reset]);

    const updateProfile = useMutation({
        mutationFn: async (data: ProfileFormData) => {
            if (!user) throw new Error("No user");

            // Upsert profile
            const { error } = await supabase
                .from('organizer_profiles')
                .upsert({
                    id: user.id,
                    organization_name: data.organization_name,
                    support_phone: data.support_phone || null,
                    support_email: data.support_email || null,
                    logo_url: data.logo_url || null,
                    updated_at: new Date().toISOString(),
                });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizer-profile'] });
            toast({ title: "Perfil atualizado com sucesso!" });
        },
        onError: (err) => {
            console.error(err);
            toast({
                title: "Erro ao atualizar",
                description: "Não foi possível salvar as alterações.",
                variant: "destructive"
            });
        }
    });

    const onSubmit = (data: ProfileFormData) => {
        updateProfile.mutate(data);
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-gold" /></div>;
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-display text-gradient-gold">
                    Configurações da Organização
                </h1>
            </div>

            <div className="card-dashboard p-6 max-w-2xl">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/10">
                    <div className="p-3 rounded-full bg-gold/10">
                        <Building className="w-6 h-6 text-gold" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-foreground">Dadados da Empresa</h2>
                        <p className="text-sm text-muted-foreground">Como compradores verão sua marca</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome da Organização *</Label>
                            <Input
                                {...register('organization_name')}
                                className={`bg-background/50 ${errors.organization_name ? 'border-destructive' : ''}`}
                                placeholder="Ex: Sorteios do Pedro"
                            />
                            {errors.organization_name && (
                                <p className="text-sm text-destructive">{errors.organization_name.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>WhatsApp de Suporte</Label>
                                <Input
                                    {...register('support_phone')}
                                    className="bg-background/50"
                                    placeholder="(11) 99999-9999"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Email de Suporte</Label>
                                <Input
                                    {...register('support_email')}
                                    className="bg-background/50"
                                    placeholder="suporte@exemplo.com"
                                />
                                {errors.support_email && (
                                    <p className="text-sm text-destructive">{errors.support_email.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>URL do Logo (Opcional)</Label>
                            <Input
                                {...register('logo_url')}
                                className="bg-background/50"
                                placeholder="https://..."
                            />
                            <p className="text-xs text-muted-foreground">Cole o link direto da imagem da sua logomarca.</p>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button
                            type="submit"
                            className="btn-gold min-w-[150px]"
                            disabled={isSubmitting || updateProfile.isPending}
                        >
                            {(isSubmitting || updateProfile.isPending) ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Salvar Alterações
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
