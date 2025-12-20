import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Raffle = Tables<'raffles'>;
type Purchase = Tables<'purchases'>;
type RaffleNumber = Tables<'raffle_numbers'>;

// Hook para buscar a rifa ativa
export function useActiveRaffle() {
  return useQuery({
    queryKey: ['active-raffle'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar números vendidos de uma rifa
export function useSoldNumbers(raffleId: string | undefined) {
  return useQuery({
    queryKey: ['sold-numbers', raffleId],
    queryFn: async () => {
      if (!raffleId) return [];
      
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select('number, confirmed_at')
        .eq('raffle_id', raffleId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!raffleId,
  });
}

// Hook para buscar compras por email ou telefone
export function useMyPurchases(email: string, phone: string) {
  return useQuery({
    queryKey: ['my-purchases', email, phone],
    queryFn: async () => {
      if (!email && !phone) return [];

      let query = supabase
        .from('purchases')
        .select(`
          *,
          raffle:raffles(*),
          numbers:raffle_numbers(number)
        `)
        .order('created_at', { ascending: false });

      if (email) {
        query = query.eq('buyer_email', email);
      } else if (phone) {
        query = query.eq('buyer_phone', phone.replace(/\D/g, ''));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!email || !!phone,
  });
}

// Hook para criar uma compra
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      raffleId,
      buyerName,
      buyerEmail,
      buyerPhone,
      quantity,
      pricePerNumber,
    }: {
      raffleId: string;
      buyerName: string;
      buyerEmail: string;
      buyerPhone: string;
      quantity: number;
      pricePerNumber: number;
    }) => {
      const totalAmount = quantity * pricePerNumber;

      const { data, error } = await supabase
        .from('purchases')
        .insert({
          raffle_id: raffleId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          buyer_phone: buyerPhone.replace(/\D/g, ''),
          quantity,
          total_amount: totalAmount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-raffle'] });
    },
  });
}

// Hook para reservar números
export function useReserveNumbers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      raffleId,
      purchaseId,
      numbers,
    }: {
      raffleId: string;
      purchaseId: string;
      numbers: number[];
    }) => {
      const numbersToInsert = numbers.map((num) => ({
        raffle_id: raffleId,
        purchase_id: purchaseId,
        number: num,
      }));

      const { data, error } = await supabase
        .from('raffle_numbers')
        .insert(numbersToInsert)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sold-numbers', variables.raffleId] });
    },
  });
}

// Hook para estatísticas da rifa
export function useRaffleStats(raffleId: string | undefined) {
  return useQuery({
    queryKey: ['raffle-stats', raffleId],
    queryFn: async () => {
      if (!raffleId) return null;

      const { data: raffle } = await supabase
        .from('raffles')
        .select('total_numbers')
        .eq('id', raffleId)
        .single();

      const { count: soldCount } = await supabase
        .from('raffle_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', raffleId)
        .not('confirmed_at', 'is', null);

      const { count: pendingCount } = await supabase
        .from('raffle_numbers')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', raffleId)
        .is('confirmed_at', null);

      return {
        totalNumbers: raffle?.total_numbers || 0,
        soldNumbers: soldCount || 0,
        pendingNumbers: pendingCount || 0,
        availableNumbers: (raffle?.total_numbers || 0) - (soldCount || 0) - (pendingCount || 0),
      };
    },
    enabled: !!raffleId,
  });
}
