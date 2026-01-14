-- Add locking mechanism to customer_accounts
ALTER TABLE public.customer_accounts
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;
