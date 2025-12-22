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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Plus } from 'lucide-react';

const raffleSchema = z.object({
  title: z.string().min(3, 'Título muito curto'),
  description: z.string().optional(),
  prize_description: z.string().min(3, 'Descrição do prêmio obrigatória'),
  prize_draw_details: z.string().optional(),
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
  status: z.enum(['draft', 'active', 'completed', 'cancelled']).optional(),
  draw_date: z.string().optional(),
});

type RaffleFormData = z.infer<typeof raffleSchema>;

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
          status: raffle.status as any,
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
        prize_description: data.prize_description,
        prize_draw_details: data.prize_draw_details || undefined,
        prize_top_buyer: data.prize_top_buyer || undefined,
        prize_top_buyer_details: data.prize_top_buyer_details || undefined,
        prize_second_top_buyer: data.prize_second_top_buyer || undefined,
        prize_second_top_buyer_details: data.prize_second_top_buyer_details || undefined,
        price_per_number: data.price_per_number,
        total_numbers: data.total_numbers,
        description: data.description,
        image_url: data.image_url || undefined,
        pix_key: data.pix_key,
        pix_key_type: data.pix_key_type,
        pix_beneficiary_name: data.pix_beneficiary_name,
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
        <p className="text-muted-foreground">Crie ou edite suas rifas</p>
      </div>

      {/* Raffle selector */}
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
            Preencha os dados da rifa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" {...register('title')} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={watch('status')} 
                  onValueChange={(v: any) => setValue('status', v)}
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

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Prêmio Principal (Sorteio)</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prize_description">Título do Prêmio *</Label>
                  <Input id="prize_description" placeholder="Ex: iPhone 15 Pro Max" {...register('prize_description')} />
                  {errors.prize_description && <p className="text-sm text-destructive">{errors.prize_description.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prize_draw_details">Detalhes do Prêmio</Label>
                  <Textarea id="prize_draw_details" placeholder="Especificações, cor, memória, etc..." {...register('prize_draw_details')} />
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Prêmios de Ranking</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Top Comprador (1º Lugar)</h4>
                  <div className="space-y-2">
                    <Label htmlFor="prize_top_buyer">Título</Label>
                    <Input id="prize_top_buyer" placeholder="Ex: R$ 1.000 no PIX" {...register('prize_top_buyer')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize_top_buyer_details">Detalhes</Label>
                    <Textarea id="prize_top_buyer_details" placeholder="Descrição detalhada..." {...register('prize_top_buyer_details')} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">2º Top Comprador</h4>
                  <div className="space-y-2">
                    <Label htmlFor="prize_second_top_buyer">Título</Label>
                    <Input id="prize_second_top_buyer" placeholder="Ex: R$ 500 no PIX" {...register('prize_second_top_buyer')} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prize_second_top_buyer_details">Detalhes</Label>
                    <Textarea id="prize_second_top_buyer_details" placeholder="Descrição detalhada..." {...register('prize_second_top_buyer_details')} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Geral da Rifa</Label>
              <Textarea id="description" placeholder="Descrição da rifa e seu motivo..." {...register('description')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL da Imagem</Label>
              <Input id="image_url" type="url" placeholder="https://..." {...register('image_url')} />
              {errors.image_url && <p className="text-sm text-destructive">{errors.image_url.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_number">Preço por Número (R$) *</Label>
                <Input id="price_per_number" type="number" step="0.01" {...register('price_per_number')} />
                {errors.price_per_number && <p className="text-sm text-destructive">{errors.price_per_number.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_numbers">Total de Números *</Label>
                <Input id="total_numbers" type="number" {...register('total_numbers')} />
                {errors.total_numbers && <p className="text-sm text-destructive">{errors.total_numbers.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="draw_date">Data do Sorteio</Label>
                <Input id="draw_date" type="datetime-local" {...register('draw_date')} />
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Configurações de PIX</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <Button 
              type="submit" 
              disabled={upsertRaffle.isPending}
              className="bg-gradient-gold text-primary-foreground hover:opacity-90"
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
