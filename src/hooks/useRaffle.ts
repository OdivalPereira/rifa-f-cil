import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Raffle = Tables<'raffles'>;
type OrganizerProfile = Tables<'organizer_profiles'>;
export type RaffleWithOrganizer = Raffle & {
  organizer: OrganizerProfile | null;
};

type Purchase = Tables<'purchases'>;
type RaffleNumber = Tables<'raffle_numbers'>;

// --- Query Key Factory ---
export const raffleKeys = {
  all: ['raffles'] as const,
  active: () => [...raKeys.all, 'active'] as const,
  stats: (id: string | undefined) => [...raKeys.all, 'stats', id] as const,
  soldNumbers: (id: string | undefined) => [...raKeys.all, 'sold-numbers', id] as const,
  recentPublic: () => [...raKeys.all, 'recent-public'] as const,
  purchases: {
    all: ['purchases'] as const,
    recent: () => ['purchases', 'recent'] as const,
    my: (email: string, phone: string) => ['purchases', 'my', email, phone] as const,
    userTotal: (phone: string | null) => ['purchases', 'total', phone] as const,
  },
  rankings: {
    referral: (id: string | undefined, limit: number) => ['rankings', 'referral', id, limit] as const,
    topBuyers: (id: string | undefined, limit: number) => ['rankings', 'top-buyers', id, limit] as const,
  },
  accounts: {
    referral: (phone: string | null) => ['accounts', 'referral', phone] as const,
  }
};
const raKeys = raffleKeys; // Alias for convenience

// --- Hooks ---

// Hook para buscar a rifa ativa
export function useActiveRaffle() {
  return useQuery({
    queryKey: raKeys.active(),
    queryFn: async (): Promise<RaffleWithOrganizer | null> => {
      // 1. Fetch active raffle
      const { data: raffle, error } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!raffle) return null;

      // 2. Fetch organizer profile if owner_id exists
      let organizer: OrganizerProfile | null = null;
      if (raffle.owner_id) {
        const { data: profile } = await supabase
          .from('organizer_profiles')
          .select('*')
          .eq('id', raffle.owner_id)
          .maybeSingle();
        organizer = profile;
      }

      return {
        ...raffle,
        organizer,
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute for active raffle (faster updates)
  });
}

// Hook para buscar números vendidos de uma rifa
export function useSoldNumbers(raffleId: string | undefined) {
  return useQuery({
    queryKey: raKeys.soldNumbers(raffleId),
    queryFn: async (): Promise<Pick<RaffleNumber, 'number' | 'confirmed_at'>[]> => {
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
export function useMyPurchases(email: string, phone: string, token?: string | null) {
  return useQuery({
    queryKey: ['my-purchases', email, phone, token],
    queryFn: async () => {
      // 1. Secure Path: If token is present, use Edge Function
      if (token) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/customer-auth?action=get-my-purchases`,
          {
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${token}`
            },
          }
        );

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || 'Failed to fetch purchases');
        }

        const data = await response.json();
        return data;
      }

      // 2. Legacy/Insecure Path: Direct DB query (fallback)
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
    enabled: !!email || !!phone || !!token,
  });
}

// Hook para criar uma compra (com suporte a referrer_id e captura de localização)
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

      // Capture location silently (non-blocking, with timeout)
      const location = await captureUserLocation();

      // Check for referral code in localStorage
      const referrerCode = localStorage.getItem('rifa_referrer');
      let referrerId: string | null = null;

      if (referrerCode) {
        // Look up the referrer's customer_accounts.id
        const { data: referrerAccount } = await supabase
          .from('customer_accounts')
          .select('id')
          .eq('referral_code', referrerCode)
          .maybeSingle();

        if (referrerAccount) {
          referrerId = referrerAccount.id;
        }

        // Clear localStorage after use (one-time attribution)
        localStorage.removeItem('rifa_referrer');
      }

      // Generate ID client-side
      const id = crypto.randomUUID();

      // Build insert data
      const insertData = {
        id,
        raffle_id: raffleId,
        buyer_name: buyerName,
        buyer_email: buyerEmail,
        buyer_phone: buyerPhone.replace(/\D/g, ''),
        quantity,
        total_amount: totalAmount,
        ...(referrerId ? { referrer_id: referrerId } : {}),
        ...(location ? { location } : {}),
      };

      const { error } = await supabase
        .from('purchases')
        .insert(insertData as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      if (error) throw error;

      // Return constructed object to avoid needing SELECT permissions
      return {
        ...insertData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
        pix_transaction_id: null,
        approved_at: null,
        approved_by: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-raffle'] });
      queryClient.invalidateQueries({ queryKey: ['recent-purchases-public'] });
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

// Hook para buscar ranking de indicadores (referral_ranking view)
export function useReferralRanking(raffleId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ['referral-ranking', raffleId, limit],
    queryFn: async () => {
      if (!raffleId) return [];

      // Query the view - cast to any since view types not yet generated
      const { data, error } = await supabase
        .from('referral_ranking' as any)
        .select('*')
        .eq('raffle_id', raffleId)
        .limit(limit);

      if (error) {
        console.error('Referral ranking query error:', error);
        return [];
      }

      return (data || []) as unknown as Array<{
        referrer_id: string;
        referrer_phone: string;
        referral_code: string;
        raffle_id: string;
        sales_count: number;
        tickets_sold: number;
        total_revenue: number;
      }>;
    },
    enabled: !!raffleId,
  });
}

// Hook para buscar ranking de compradores (top_buyers_ranking view)
export function useTopBuyersRanking(raffleId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ['top-buyers-ranking', raffleId, limit],
    queryFn: async () => {
      if (!raffleId) return [];

      // Query the view - cast to any since view types not yet generated
      const { data, error } = await supabase
        .from('top_buyers_ranking' as any)
        .select('*')
        .eq('raffle_id', raffleId)
        .limit(limit);

      if (error) {
        console.error('Top buyers ranking query error:', error);
        return [];
      }

      return (data || []) as unknown as Array<{
        buyer_phone: string;
        buyer_name: string;
        raffle_id: string;
        purchase_count: number;
        tickets_bought: number;
        total_spent: number;
      }>;
    },
    enabled: !!raffleId,
  });
}

// Hook para buscar/gerar código de indicação do usuário
export function useUserReferralCode(phone: string | null) {
  return useQuery({
    queryKey: ['user-referral-code', phone],
    queryFn: async () => {
      if (!phone) return null;

      const cleanPhone = phone.replace(/\D/g, '');

      // Get user's customer account
      const { data: account, error } = await supabase
        .from('customer_accounts')
        .select('id, referral_code')
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer account:', error);
        return null;
      }

      return account;
    },
    enabled: !!phone,
  });
}

// Hook para gerar código de indicação
export function useGenerateReferralCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      // Generate a unique 8-character code
      const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      let code = generateCode();
      let attempts = 0;
      const maxAttempts = 10;

      // Try to find a unique code
      while (attempts < maxAttempts) {
        const { data: existing } = await supabase
          .from('customer_accounts')
          .select('id')
          .eq('referral_code', code)
          .maybeSingle();

        if (!existing) break;
        code = generateCode();
        attempts++;
      }

      // Update the account with the new code
      const { data, error } = await supabase
        .from('customer_accounts')
        .update({ referral_code: code } as any)
        .eq('id', accountId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-referral-code'] });
    },
  });
}

// Hook para buscar total de números comprados por um usuário
export function useUserTotalNumbers(phone: string | null) {
  return useQuery({
    queryKey: ['user-total-numbers', phone],
    queryFn: async () => {
      if (!phone) return 0;

      const cleanPhone = phone.replace(/\D/g, '');

      const { data, error } = await supabase
        .from('purchases')
        .select('quantity')
        .eq('buyer_phone', cleanPhone)
        .eq('payment_status', 'approved');

      if (error) {
        console.error('Error fetching user purchases:', error);
        return 0;
      }

      return data?.reduce((sum, p) => sum + p.quantity, 0) || 0;
    },
    enabled: !!phone,
  });
}

// Hook para buscar compras recentes com dados sanitizados (para Social Proof)
export function useRecentPurchasesPublic() {
  return useQuery({
    queryKey: raKeys.recentPublic(),
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_recent_purchases_public');
      if (error) {
        console.error('Error fetching recent purchases:', error);
        return [];
      }
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

// Hook de Prefetching para a home
export function usePrefetchRaffleData(raffleId: string | undefined) {
  const queryClient = useQueryClient();

  const prefetch = useCallback(async () => {
    if (!raffleId) return;

    // Prefetch rankings and stats simultaneously
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: raKeys.rankings.referral(raffleId, 10),
        queryFn: () => fetchReferralRanking(raffleId, 10),
      }),
      queryClient.prefetchQuery({
        queryKey: raKeys.rankings.topBuyers(raffleId, 10),
        queryFn: () => fetchTopBuyersRanking(raffleId, 10),
      }),
      queryClient.prefetchQuery({
        queryKey: raKeys.stats(raffleId),
        queryFn: () => fetchRaffleStats(raffleId),
      }),
    ]);
  }, [raffleId, queryClient]);

  return { prefetch };
}

// Internal Fetchers (for reuse in prefetch and query hooks)
async function fetchReferralRanking(raffleId: string, limit: number) {
  const { data, error } = await supabase
    .from('referral_ranking' as any)
    .select('*')
    .eq('raffle_id', raffleId)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function fetchTopBuyersRanking(raffleId: string, limit: number) {
  const { data, error } = await supabase
    .from('top_buyers_ranking' as any)
    .select('*')
    .eq('raffle_id', raffleId)
    .limit(limit);
  if (error) throw error;
  return data || [];
}

async function fetchRaffleStats(raffleId: string) {
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
}

// Utility function to capture user location via IP geolocation (for purchases)
export async function captureUserLocation(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

    const response = await fetch('https://ipapi.co/json/', {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();

    // Return "City/State" format (e.g., "Dourados/MS")
    if (data.city && data.region_code) {
      return `${data.city}/${data.region_code}`;
    }
  } catch {
    // Silently fail - location is optional
  }
  return null;
}
