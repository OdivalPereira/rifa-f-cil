import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SpinBalance {
  id: string;
  email: string | null;
  phone: string | null;
  spins_available: number;
  created_at: string;
  updated_at: string;
}

export function useSpinRewards() {
  const [isLoading, setIsLoading] = useState(false);

  const spin = async (email?: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('spin-wheel', {
        body: { email, phone }
      });

      if (error) throw error;

      return data;
    } catch (error: unknown) {
      console.error('Error spinning wheel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao girar a roleta';
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async (email?: string, phone?: string): Promise<SpinBalance | null> => {
    // Fetch directly from DB using type assertion for new table
    let query = (supabase.from as any)('spin_balance').select('*');
    if (email) query = query.eq('email', email);
    else if (phone) query = query.eq('phone', phone);
    else return null;

    const { data, error } = await query.single();
    if (error) return null;
    return data as SpinBalance;
  };

  return { spin, getBalance, isLoading };
}
