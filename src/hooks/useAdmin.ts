import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Hook para buscar todas as rifas (admin)
export function useAllRaffles() {
  return useQuery({
    queryKey: ['all-raffles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar compras pendentes
export function usePendingPurchases() {
  return useQuery({
    queryKey: ['pending-purchases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          raffle:raffles(title),
          numbers:raffle_numbers(number),
          receipt_url
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as any;
    },
  });
}

// Hook para buscar todas as compras
export function useAllPurchases(raffleId?: string) {
  return useQuery({
    queryKey: ['all-purchases', raffleId],
    queryFn: async () => {
      let query = supabase
        .from('purchases')
        .select(`
          *,
          raffle:raffles(title),
          numbers:raffle_numbers(number),
          receipt_url
        `)
        .order('created_at', { ascending: false });

      if (raffleId) {
        query = query.eq('raffle_id', raffleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as any;
    },
  });
}

// Hook para aprovar/rejeitar pagamento
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      purchaseId,
      status,
      userId,
    }: {
      purchaseId: string;
      status: 'approved' | 'rejected';
      userId: string;
    }) => {
      // 1. Buscar dados atuais para pegar a URL do recibo (se houver)
      const { data: currentPurchase, error: fetchError } = await supabase
        .from('purchases')
        .select('receipt_url')
        .eq('id', purchaseId)
        .single();

      if (fetchError) throw fetchError;

      const updateData: any = {
        payment_status: status,
      };

      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = userId;

        // Also confirm all numbers for this purchase
        await supabase
          .from('raffle_numbers')
          .update({ confirmed_at: new Date().toISOString() })
          .eq('purchase_id', purchaseId);
      }

      // 2. Tentar deletar o comprovante do Storage se ele existir
      // Independentemente de aprovar ou rejeitar, o comprovante "temporário" já cumpriu seu papel
      if ((currentPurchase as any)?.receipt_url) {
        try {
          // Extrair nome do arquivo da URL (assumindo padrão ou buscando info)
          // Mas como usamos o ID da compra como nome do arquivo, é mais seguro tentar deletar direto pelo ID.
          // Formato salvo: `${purchaseId}.[ext]` - precisamos descobrir a extensão ou tentar deletar as mais comuns
          // Ou simplesmente deletar buscando na lista.

          // Melhor abordagem: listar arquivos com prefixo do ID e deletar
          const { data: files } = await supabase.storage
            .from('receipts')
            .list('', { search: purchaseId });

          if (files && files.length > 0) {
            const filesToRemove = files.map(f => f.name);
            await supabase.storage
              .from('receipts')
              .remove(filesToRemove);
          }

          // Limpar a URL do banco para não ficar link quebrado
          updateData.receipt_url = null;
          updateData.receipt_uploaded_at = null;
        } catch (err) {
          console.error("Erro ao limpar comprovante:", err);
          // Não impedir o fluxo principal por erro na deleção
        }
      }

      const { data, error } = await supabase
        .from('purchases')
        .update(updateData)
        .eq('id', purchaseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['all-purchases'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });
}

// Hook para criar/atualizar rifa
export function useUpsertRaffle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (raffle: {
      id?: string;
      title: string;
      description?: string;
      prize_description: string;
      prize_draw_details?: string;
      prize_referral_1st?: string;
      referral_threshold?: number;
      prize_buyer_1st?: string;
      prize_referral_runners?: string;
      prize_buyer_runners?: string;
      prize_top_buyer?: string;
      prize_top_buyer_details?: string;
      prize_second_top_buyer?: string;
      prize_second_top_buyer_details?: string;
      image_url?: string;
      price_per_number: number;
      total_numbers: number;
      pix_key?: string;
      pix_key_type?: string;
      pix_beneficiary_name?: string;
      short_code?: string;
      pix_change_notification_email?: string;
      status?: 'draft' | 'active' | 'completed' | 'cancelled';
      draw_date?: string;
    }) => {
      if (raffle.id) {
        const { data, error } = await supabase
          .from('raffles')
          .update(raffle)
          .eq('id', raffle.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('raffles')
          .insert(raffle)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-raffles'] });
      queryClient.invalidateQueries({ queryKey: ['active-raffle'] });
    },
  });
}

// Hook para estatísticas do admin
export function useAdminStats(raffleId?: string) {
  return useQuery({
    queryKey: ['admin-stats', raffleId],
    queryFn: async () => {
      let purchasesQuery = supabase
        .from('purchases')
        .select('payment_status, total_amount, quantity');

      if (raffleId) {
        purchasesQuery = purchasesQuery.eq('raffle_id', raffleId);
      }

      const { data: purchases } = await purchasesQuery;

      const totalRevenue = purchases
        ?.filter(p => p.payment_status === 'approved')
        .reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

      const pendingRevenue = purchases
        ?.filter(p => p.payment_status === 'pending')
        .reduce((sum, p) => sum + Number(p.total_amount), 0) || 0;

      const totalSold = purchases
        ?.filter(p => p.payment_status === 'approved')
        .reduce((sum, p) => sum + p.quantity, 0) || 0;

      const pendingCount = purchases?.filter(p => p.payment_status === 'pending').length || 0;

      return {
        totalRevenue,
        pendingRevenue,
        totalSold,
        pendingCount,
        totalPurchases: purchases?.length || 0,
      };
    },
  });
}

// Hook para realizar sorteio principal (entre todos os números)
export function useDrawWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (raffleId: string) => {
      // Get all confirmed numbers
      const { data: numbers, error: numbersError } = await supabase
        .from('raffle_numbers')
        .select(`
          number,
          purchase:purchases(buyer_name)
        `)
        .eq('raffle_id', raffleId)
        .not('confirmed_at', 'is', null);

      if (numbersError) throw numbersError;
      if (!numbers || numbers.length === 0) throw new Error('Nenhum número vendido');

      // Random selection
      const winnerIndex = Math.floor(Math.random() * numbers.length);
      const winner = numbers[winnerIndex];

      // Update raffle with winner
      const { data, error } = await supabase
        .from('raffles')
        .update({
          winner_number: winner.number,
          winner_name: (winner.purchase as any)?.buyer_name || 'Desconhecido',
          status: 'completed',
        })
        .eq('id', raffleId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-raffles'] });
      queryClient.invalidateQueries({ queryKey: ['active-raffle'] });
    },
  });
}

// Hook para buscar ranking de compradores
export function useTopBuyers(raffleId: string | undefined, limit: number = 30) {
  return useQuery({
    queryKey: ['top-buyers', raffleId, limit],
    queryFn: async () => {
      if (!raffleId) return [];

      const { data: purchases, error } = await supabase
        .from('purchases')
        .select('buyer_name, buyer_email, buyer_phone, quantity')
        .eq('raffle_id', raffleId)
        .eq('payment_status', 'approved');

      if (error) throw error;

      // Agrupa por comprador (usando phone como identificador único)
      const buyerMap = new Map<string, { name: string; phone: string; email: string; total: number }>();

      purchases?.forEach(p => {
        const key = p.buyer_phone;
        const existing = buyerMap.get(key);
        if (existing) {
          existing.total += p.quantity;
        } else {
          buyerMap.set(key, {
            name: p.buyer_name,
            phone: p.buyer_phone,
            email: p.buyer_email,
            total: p.quantity,
          });
        }
      });

      // Ordena por quantidade e retorna o top N
      return Array.from(buyerMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, limit);
    },
    enabled: !!raffleId,
  });
}

// Hook para sortear entre top compradores
export function useDrawTopBuyerWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      raffleId,
      topN,
      prizeType
    }: {
      raffleId: string;
      topN: number;
      prizeType: 'top_buyer' | 'second_top_buyer';
    }) => {
      // Get all approved purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('buyer_name, buyer_phone, quantity')
        .eq('raffle_id', raffleId)
        .eq('payment_status', 'approved');

      if (purchasesError) throw purchasesError;
      if (!purchases || purchases.length === 0) throw new Error('Nenhuma compra aprovada');

      // Agrupa por comprador
      const buyerMap = new Map<string, { name: string; phone: string; total: number }>();

      purchases.forEach(p => {
        const key = p.buyer_phone;
        const existing = buyerMap.get(key);
        if (existing) {
          existing.total += p.quantity;
        } else {
          buyerMap.set(key, {
            name: p.buyer_name,
            phone: p.buyer_phone,
            total: p.quantity,
          });
        }
      });

      // Pega os top N compradores
      const topBuyers = Array.from(buyerMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, topN);

      if (topBuyers.length === 0) throw new Error(`Não há compradores suficientes para sortear`);

      // Sorteia um ganhador entre os top N
      const winnerIndex = Math.floor(Math.random() * topBuyers.length);
      const winner = topBuyers[winnerIndex];

      // Atualiza a rifa com o ganhador do prêmio de ranking
      const updateData = prizeType === 'top_buyer'
        ? {
          winner_top_buyer_name: winner.name,
          winner_top_buyer_number: winner.total,
        }
        : {
          winner_second_top_buyer_name: winner.name,
          winner_second_top_buyer_number: winner.total,
        };

      const { data, error } = await supabase
        .from('raffles')
        .update(updateData)
        .eq('id', raffleId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, winner };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-raffles'] });
      queryClient.invalidateQueries({ queryKey: ['active-raffle'] });
    },
  });
}
