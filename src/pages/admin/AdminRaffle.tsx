import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAllRaffles, useUpsertRaffle } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus } from 'lucide-react';

const raffleSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().optional(),
  prize_description: z.string().min(3, 'Descrição do prêmio obrigatória'),
  prize_draw_details: z.string().optional(),

  // New Gamification Fields
  prize_referral_1st: z.string().optional(),
  referral_threshold: z.coerce.number().optional(),
  prize_buyer_1st: z.string().optional(),
  prize_referral_runners: z.string().optional(),
  prize_buyer_runners: z.string().optional(),

  // Legacy fields (kept for compatibility or hidden)
  prize_top_buyer: z.string().optional(),
  prize_top_buyer_details: z.string().optional(),
  prize_second_top_buyer: z.string().optional(),
  prize_second_top_buyer_details: z.string().optional(),

  image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  price_per_number: z.coerce.number().min(0.01, 'Preço deve ser maior que 0'),
  total_numbers: z.coerce.number().min(10, 'Mínimo 10 números').max(100000, 'Máximo 100.000 números'),
  pix_key: z.string().optional(),
  pix_key_type: z.string().optional(),
  pix_beneficiary_name: z.string().optional(),
  short_code: z.string().max(10, 'Máximo 10 caracteres').optional(),
  pix_change_notification_email: z.string().email('Email inválido').optional().or(z.literal('')),
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  draw_date: z.string().optional(),
});

type RaffleFormData = z.infer<typeof raffleSchema>;

type RaffleStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export default function AdminRaffle() {
  const { toast } = useToast();
  const { data: raffles, isLoading } = useAllRaffles();
  const upsertRaffle = useUpsertRaffle();
  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null);

  const selectedRaffle = raffles?.find(r => r.id === selectedRaffleId);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RaffleFormData>({
    resolver: zodResolver(raffleSchema),
    defaultValues: {
      price_per_number: 0.50,
      total_numbers: 10000,
      status: 'draft',
    },
  });

  const handleSelectRaffle = (id: string) => {
    if (id === 'new') {
      setSelectedRaffleId(null);
      reset({
        title: '',
        description: '',
        prize_description: '',
        prize_draw_details: '',
        prize_referral_1st: '',
        referral_threshold: undefined,
        prize_buyer_1st: '',
        prize_referral_runners: '',
        prize_buyer_runners: '',
        prize_top_buyer: '',
        prize_top_buyer_details: '',
        prize_second_top_buyer: '',
        prize_second_top_buyer_details: '',
        image_url: '',
        price_per_number: 0.50,
        total_numbers: 10000,
        pix_key: '',
        pix_key_type: '',
        pix_beneficiary_name: '',
        short_code: '',
        pix_change_notification_email: '',
        status: 'draft',
        draw_date: '',
      });
    } else {
      const raffle = raffles?.find(r => r.id === id);
      if (raffle) {
        setSelectedRaffleId(id);
        reset({
          title: raffle.title,
          description: raffle.description || '',
          prize_description: raffle.prize_description,
          prize_draw_details: raffle.prize_draw_details || '',

          prize_referral_1st: raffle.prize_referral_1st || '',
          referral_threshold: raffle.referral_threshold || undefined,
          prize_buyer_1st: raffle.prize_buyer_1st || '',
          prize_referral_runners: raffle.prize_referral_runners || '',
          prize_buyer_runners: raffle.prize_buyer_runners || '',

          prize_top_buyer: raffle.prize_top_buyer || '',
          prize_top_buyer_details: raffle.prize_top_buyer_details || '',
          prize_second_top_buyer: raffle.prize_second_top_buyer || '',
          prize_second_top_buyer_details: raffle.prize_second_top_buyer_details || '',

          image_url: raffle.image_url || '',
          price_per_number: Number(raffle.price_per_number),
          total_numbers: raffle.total_numbers,
          pix_key: raffle.pix_key || '',
          pix_key_type: raffle.pix_key_type || '',
          pix_beneficiary_name: raffle.pix_beneficiary_name || '',
          short_code: (raffle as any).short_code || '',
          pix_change_notification_email: (raffle as any).pix_change_notification_email || '',
          status: raffle.status as RaffleStatus,
          draw_date: raffle.draw_date ? raffle.draw_date.slice(0, 16) : '',
        });
      }
    }
  };

  const onSubmit = async (data: RaffleFormData) => {
    try {
      await upsertRaffle.mutateAsync({
        id: selectedRaffleId || undefined,
        title: data.title,
        description: data.description,
        prize_description: data.prize_description,
        prize_draw_details: data.prize_draw_details || undefined,

        prize_referral_1st: data.prize_referral_1st || undefined,
        referral_threshold: data.referral_threshold,
        prize_buyer_1st: data.prize_buyer_1st || undefined,
        prize_referral_runners: data.prize_referral_runners || undefined,
        prize_buyer_runners: data.prize_buyer_runners || undefined,

        prize_top_buyer: data.prize_top_buyer || undefined,
        prize_top_buyer_details: data.prize_top_buyer_details || undefined,
        prize_second_top_buyer: data.prize_second_top_buyer || undefined,
        prize_second_top_buyer_details: data.prize_second_top_buyer_details || undefined,

        price_per_number: data.price_per_number,
        total_numbers: data.total_numbers,
        image_url: data.image_url || undefined,
        pix_key: data.pix_key,
        pix_key_type: data.pix_key_type,
        pix_beneficiary_name: data.pix_beneficiary_name,
        short_code: data.short_code,
        pix_change_notification_email: data.pix_change_notification_email,
        status: data.status,
        draw_date: data.draw_date || undefined,
      });

      toast({
        title: selectedRaffleId ? 'Rifa atualizada!' : 'Rifa criada!',
        description: 'As alterações foram salvas com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível salvar a rifa.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-display font-bold">Gerenciar Rifa</h1>
        <p className="text-muted-foreground">Crie ou edite suas rifas e configure todos os prêmios.</p>
      </div>

      <div className="flex gap-2">
        <Select value={selectedRaffleId || 'new'} onValueChange={handleSelectRaffle}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecionar rifa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Nova Rifa
              </span>
            </SelectItem>
            {raffles?.map((raffle) => (
              <SelectItem key={raffle.id} value={raffle.id}>
                {raffle.title} ({raffle.status})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle>{selectedRaffleId ? 'Editar Rifa' : 'Nova Rifa'}</CardTitle>
          <CardDescription>
            Configure os detalhes da rifa e regras de premiação.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

            <Tabs defaultValue="geral" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="geral">Geral & Sorteio</TabsTrigger>
                <TabsTrigger value="indicacoes">Indicações</TabsTrigger>
                <TabsTrigger value="compradores">Compradores</TabsTrigger>
              </TabsList>

              {/* ABA GERAL & SORTEIO */}
              <TabsContent value="geral" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título da Rifa *</Label>
                    <Input id="title" {...register('title')} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={watch('status')}
                      onValueChange={(v: RaffleStatus) => setValue('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="active">Ativa</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição Geral</Label>
                  <Textarea id="description" placeholder="Descrição da rifa e seu motivo..." {...register('description')} />
                </div>

                <div className="border p-4 rounded-md space-y-4 bg-muted/20 border-gold/20">
                  <h3 className="font-semibold text-gold flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Prêmio Principal (Sorteio)
                  </h3>
                  <div className="space-y-2">
                    <Label htmlFor="prize_description">Título do Prêmio Principal *</Label>
                    <Input id="prize_description" placeholder="Ex: iPhone 15 Pro Max" {...register('prize_description')} />
                    {errors.prize_description && <p className="text-sm text-destructive">{errors.prize_description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prize_draw_details">Detalhes do Prêmio</Label>
                    <Textarea id="prize_draw_details" placeholder="Especificações, cor, memória, etc..." {...register('prize_draw_details')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price_per_number">Preço (R$) *</Label>
                    <Input id="price_per_number" type="number" step="0.01" {...register('price_per_number')} />
                    {errors.price_per_number && <p className="text-sm text-destructive">{errors.price_per_number.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_numbers">Total de Números *</Label>
                    <Input id="total_numbers" type="number" {...register('total_numbers')} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="draw_date">Data do Sorteio</Label>
                    <Input id="draw_date" type="datetime-local" {...register('draw_date')} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input id="image_url" type="url" placeholder="https://..." {...register('image_url')} />
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-semibold mb-4 text-gold">Configurações de PIX</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="short_code">Código Curto da Rifa (PIX)</Label>
                      <Input id="short_code" placeholder="Ex: ODS2" {...register('short_code')} />
                      <p className="text-xs text-muted-foreground">Usado na descrição do PIX.</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pix_change_notification_email">Email Notificação de Alteração</Label>
                      <Input id="pix_change_notification_email" type="email" {...register('pix_change_notification_email')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="pix_key">Chave PIX</Label>
                      <Input id="pix_key" {...register('pix_key')} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pix_key_type">Tipo da Chave</Label>
                      <Select
                        value={watch('pix_key_type') || ''}
                        onValueChange={(v) => setValue('pix_key_type', v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cpf">CPF</SelectItem>
                          <SelectItem value="cnpj">CNPJ</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="phone">Telefone</SelectItem>
                          <SelectItem value="random">Chave Aleatória</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pix_beneficiary_name">Nome do Beneficiário</Label>
                      <Input id="pix_beneficiary_name" {...register('pix_beneficiary_name')} />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ABA GAMIFICAÇÃO - INDICAÇÕES */}
              <TabsContent value="indicacoes" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4 bg-muted/20 border-gold/20">
                    <h3 className="font-semibold text-gold">Top Indicador (1º Lugar)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="prize_referral_1st">Descrição do Prêmio</Label>
                      <Textarea
                        id="prize_referral_1st"
                        placeholder="Ex: R$ 500 no PIX para quem mais indicar."
                        {...register('prize_referral_1st')}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral_threshold">Meta de Vendas (Gatilho)</Label>
                      <Input
                        id="referral_threshold"
                        type="number"
                        placeholder="Ex: 6000"
                        {...register('referral_threshold')}
                      />
                      <p className="text-sm text-muted-foreground">
                        Entregar prêmio imediatamente ao atingir X vendas totais da rifa.
                      </p>
                    </div>
                  </div>

                  <div className="border p-4 rounded-md space-y-4 bg-muted/20 border-emerald/20">
                    <h3 className="font-semibold text-emerald">Indicadores Secundários (2º ao 5º Lugar)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="prize_referral_runners">Descrição dos Prêmios</Label>
                      <Textarea
                        id="prize_referral_runners"
                        placeholder="Ex: R$ 50 para o 2º, R$ 30 para o 3º... (Opcional)"
                        {...register('prize_referral_runners')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ABA GAMIFICAÇÃO - COMPRADORES */}
              <TabsContent value="compradores" className="space-y-6 pt-4">
                <div className="space-y-4">
                  <div className="border p-4 rounded-md space-y-4 bg-muted/20 border-gold/20">
                    <h3 className="font-semibold text-gold">Maior Comprador (Top Comprador)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="prize_buyer_1st">Descrição do Prêmio Principal</Label>
                      <Textarea
                        id="prize_buyer_1st"
                        placeholder="Ex: R$ 1000 no PIX para o maior comprador."
                        {...register('prize_buyer_1st')}
                      />
                    </div>
                  </div>

                  <div className="border p-4 rounded-md space-y-4 bg-muted/20 border-emerald/20">
                    <h3 className="font-semibold text-emerald">Compradores Secundários (2º ao 5º Lugar)</h3>

                    <div className="space-y-2">
                      <Label htmlFor="prize_buyer_runners">Descrição dos Prêmios</Label>
                      <Textarea
                        id="prize_buyer_runners"
                        placeholder="Ex: R$ 200 para o 2º, R$ 100 para o 3º... (Opcional)"
                        {...register('prize_buyer_runners')}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <Button
              type="submit"
              disabled={upsertRaffle.isPending}
              className="w-full bg-gradient-gold text-primary-foreground hover:opacity-90 mt-6"
            >
              {upsertRaffle.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {selectedRaffleId ? 'Salvar Alterações' : 'Criar Rifa'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
