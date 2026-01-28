-- Security Fix: Restrict access to purchases table and mask PII in ranking views

-- 1. Restrict Access to Purchases Table
-- Drop the insecure policy that allowed public access via "Buyers can view own purchases" USING (true)
DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.purchases;

-- Create a restrictive policy for Admins only
-- Service Role bypasses RLS by default, so no policy needed for it.
CREATE POLICY "Admins can view purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Secure and Mask Top Buyers Ranking
-- Re-create as SECURITY DEFINER (security_invoker = false) to bypass RLS on purchases
-- Mask phone numbers and sanitize names to prevent PII leakage
DROP VIEW IF EXISTS public.top_buyers_ranking;

CREATE VIEW public.top_buyers_ranking
WITH (security_invoker = false)
AS
WITH ranked_data AS (
  SELECT
    p.buyer_phone,
    -- Get the most recent name used by this phone number
    (array_agg(p.buyer_name ORDER BY p.created_at DESC))[1] as raw_name,
    p.raffle_id,
    COUNT(DISTINCT p.id) as purchase_count,
    SUM(p.quantity) as tickets_bought,
    SUM(p.total_amount) as total_spent
  FROM public.purchases p
  WHERE p.payment_status = 'approved'
  GROUP BY p.buyer_phone, p.raffle_id
)
SELECT
  -- Mask phone: Keep first 2 (DDD) and last 4. Mask middle 5. (e.g., 11*****8888)
  overlay(buyer_phone placing '*****' from 3 for 5) as buyer_phone,
  -- Sanitize name: First name + First letter of last name + . (e.g., "John D.")
  (
    CASE
      WHEN array_length(regexp_split_to_array(trim(raw_name), '\s+'), 1) > 1 THEN
        (regexp_split_to_array(trim(raw_name), '\s+'))[1] || ' ' || left((regexp_split_to_array(trim(raw_name), '\s+'))[2], 1) || '.'
      ELSE
        (regexp_split_to_array(trim(raw_name), '\s+'))[1]
    END
  ) as buyer_name,
  raffle_id,
  purchase_count::integer,
  COALESCE(tickets_bought, 0)::integer as tickets_bought,
  COALESCE(total_spent, 0)::numeric as total_spent
FROM ranked_data
ORDER BY tickets_bought DESC, total_spent DESC;

-- 3. Secure and Mask Referral Ranking
-- Re-create as SECURITY DEFINER to bypass RLS on customer_accounts and purchases
DROP VIEW IF EXISTS public.referral_ranking;

CREATE VIEW public.referral_ranking
WITH (security_invoker = false)
AS
SELECT
  ca.id as referrer_id,
  -- Mask phone: 11*****8888
  overlay(ca.phone placing '*****' from 3 for 5) as referrer_phone,
  ca.referral_code,
  p.raffle_id,
  COUNT(DISTINCT p.id) as sales_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_sold,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_revenue
FROM public.purchases p
INNER JOIN public.customer_accounts ca ON p.referrer_id = ca.id
WHERE p.payment_status = 'approved'
GROUP BY ca.id, ca.phone, ca.referral_code, p.raffle_id
ORDER BY tickets_sold DESC, total_revenue DESC, sales_count DESC;

COMMENT ON VIEW public.top_buyers_ranking IS 'Ranking of buyers with masked PII (Security Definer).';
COMMENT ON VIEW public.referral_ranking IS 'Ranking of referrers with masked PII (Security Definer).';
