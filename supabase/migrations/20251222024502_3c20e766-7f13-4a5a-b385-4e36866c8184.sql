-- Create spin_balance table
CREATE TABLE public.spin_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  spins_available INTEGER NOT NULL DEFAULT 0,
  total_spins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email),
  UNIQUE(phone)
);

ALTER TABLE public.spin_balance ADD CONSTRAINT spin_balance_identity_check CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Create spin_history table
CREATE TABLE public.spin_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  prize_type TEXT NOT NULL,
  prize_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.spin_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spin balance" ON public.spin_balance FOR SELECT USING (true);
CREATE POLICY "Service role can update spin balance" ON public.spin_balance FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert spin history" ON public.spin_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view spin history" ON public.spin_history FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_spin_balance_email ON public.spin_balance(email);
CREATE INDEX idx_spin_balance_phone ON public.spin_balance(phone);
CREATE INDEX idx_spin_history_email ON public.spin_history(email);
CREATE INDEX idx_spin_history_phone ON public.spin_history(phone);

-- Trigger to grant spins on purchase
CREATE OR REPLACE FUNCTION public.grant_spins_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved') THEN
    IF NEW.buyer_email IS NOT NULL THEN
        INSERT INTO public.spin_balance (email, spins_available, total_spins)
        VALUES (NEW.buyer_email, 1, 1)
        ON CONFLICT (email) DO UPDATE
        SET spins_available = spin_balance.spins_available + 1,
            total_spins = spin_balance.total_spins + 1,
            updated_at = now();
    ELSIF NEW.buyer_phone IS NOT NULL THEN
       INSERT INTO public.spin_balance (phone, spins_available, total_spins)
       VALUES (NEW.buyer_phone, 1, 1)
       ON CONFLICT (phone) DO UPDATE
       SET spins_available = spin_balance.spins_available + 1,
           total_spins = spin_balance.total_spins + 1,
           updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_grant_spins
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_spins_on_purchase();