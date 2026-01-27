-- Secure Purchases Table and Fix Ranking Views

-- 1. Drop existing insecure views (that rely on RLS being open)
DROP VIEW IF EXISTS public.referral_ranking;
DROP VIEW IF EXISTS public.top_buyers_ranking;

-- 2. Recreate views as SECURITY DEFINER (security_invoker = false)
-- This allows the view to bypass RLS on the underlying table (purchases)
-- while presenting only aggregated, non-sensitive data to the public.

CREATE VIEW public.referral_ranking
WITH (security_invoker = false) -- Run as Owner (Admin/Postgres)
AS
SELECT
  ca.id as referrer_id,
  ca.phone as referrer_phone,
  ca.referral_code,
  p.raffle_id,
  COUNT(DISTINCT p.id) as sales_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_sold,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_revenue
FROM public.purchases p
INNER JOIN public.customer_accounts ca ON p.referrer_id = ca.id
WHERE p.payment_status = 'approved'
GROUP BY ca.id, ca.phone, ca.referral_code, p.raffle_id
ORDER BY tickets_sold DESC;

CREATE VIEW public.top_buyers_ranking
WITH (security_invoker = false) -- Run as Owner (Admin/Postgres)
AS
SELECT
  p.buyer_phone,
  p.buyer_name,
  p.raffle_id,
  COUNT(DISTINCT p.id)::integer as purchase_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_bought,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_spent
FROM public.purchases p
WHERE p.payment_status = 'approved'
GROUP BY p.buyer_phone, p.buyer_name, p.raffle_id
ORDER BY tickets_bought DESC;

-- 3. Revoke Public Read Access to Purchases
-- The previous policy "Buyers can view own purchases" used "USING (true)",
-- allowing ANYONE to dump the entire purchases table.
-- We drop it. Access is now restricted to:
-- 1. Admins (via "Admins can..." policies)
-- 2. Service Role (Edge Functions)
-- 3. INSERTs (via "Anyone can create purchases")

DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.purchases;
