import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type SpinPrize = {
  type: 'fixed' | 'multiplier' | 'retry' | 'nothing';
  amount: number;
};

export type SpinResult = {
  success: boolean;
  prize: SpinPrize;
  bonusNumbersCount: number;
  bonusNumbers: number[];
};

export function useAvailableSpins(raffleId: string | undefined, email: string, phone: string) {
  return useQuery({
    queryKey: ['available-spins', raffleId, email, phone],
    queryFn: async () => {
      if (!raffleId || (!email && !phone)) return null;

      // Ensure consistent formatting
      const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

      let query = supabase
        .from('spin_rewards')
        .select('*')
        .eq('raffle_id', raffleId);

      if (email) query = query.eq('buyer_email', email);
      else if (cleanPhone) query = query.eq('buyer_phone', cleanPhone);

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error('Error fetching spins:', error);
        return null;
      }

      return data;
    },
    enabled: !!raffleId && (!!email || !!phone),
  });
}

export function useSpinWheel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      raffleId: string;
      buyerEmail: string;
      buyerPhone: string;
      spinType: 'main' | 'retry';
    }) => {
      const { data, error } = await supabase.functions.invoke<SpinResult>('spin-wheel', {
        body: params,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['available-spins'] });
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] }); // Refresh purchases to show new numbers
    },
  });
}
