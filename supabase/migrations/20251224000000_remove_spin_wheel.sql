-- Drop tables, function, and trigger related to spin wheel functionality

DROP TRIGGER IF EXISTS tr_grant_spins ON public.purchases;
DROP FUNCTION IF EXISTS public.grant_spins_on_purchase();

DROP TABLE IF EXISTS public.spin_history;
DROP TABLE IF EXISTS public.spin_balance;
