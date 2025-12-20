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
          numbers:raffle_numbers(number)
        `)
        .eq('payment_status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
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
          numbers:raffle_numbers(number)
        `)
        .order('created_at', { ascending: false });

      if (raffleId) {
        query = query.eq('raffle_id', raffleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
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
      image_url?: string;
      price_per_number: number;
      total_numbers: number;
      pix_key?: string;
      pix_key_type?: string;
      pix_beneficiary_name?: string;
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

// Hook para realizar sorteio
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
