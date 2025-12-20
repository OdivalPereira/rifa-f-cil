import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
    } catch (error: any) {
      console.error('Error spinning wheel:', error);
      toast.error(error.message || 'Erro ao girar a roleta');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async (email?: string, phone?: string) => {
      // Fetch directly from DB
      let query = supabase.from('spin_balance').select('*');
      if (email) query = query.eq('email', email);
      else if (phone) query = query.eq('phone', phone);
      else return null;

      const { data, error } = await query.single();
      if (error) return null;
      return data;
  };

  return { spin, getBalance, isLoading };
}
