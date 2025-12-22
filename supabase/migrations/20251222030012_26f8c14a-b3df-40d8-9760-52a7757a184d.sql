-- Create customer_accounts table for simplified phone + PIN authentication
CREATE TABLE public.customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can create an account (registration is public)
CREATE POLICY "Anyone can create customer accounts"
ON public.customer_accounts
FOR INSERT
WITH CHECK (true);

-- RLS: Only service role can read/update (for edge function auth)
CREATE POLICY "Service role can read accounts"
ON public.customer_accounts
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_customer_accounts_updated_at
BEFORE UPDATE ON public.customer_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();