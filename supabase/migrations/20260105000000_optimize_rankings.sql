-- Optimized Ranking Views

-- 1. Optimized Top Buyers Ranking
-- Groups by phone and raffle_id, taking the most recent name.
DROP VIEW IF EXISTS public.top_buyers_ranking;
CREATE VIEW public.top_buyers_ranking
WITH (security_invoker = on)
AS
SELECT
  p.buyer_phone,
  (array_agg(p.buyer_name ORDER BY p.created_at DESC))[1] as buyer_name,
  p.raffle_id,
  COUNT(DISTINCT p.id)::integer as purchase_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_bought,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_spent
FROM public.purchases p
WHERE p.payment_status = 'approved'
GROUP BY p.buyer_phone, p.raffle_id
ORDER BY tickets_bought DESC, total_spent DESC;

-- 2. Optimized Referral Ranking
-- Ensures tie-breaking and numerical casting consistency.
DROP VIEW IF EXISTS public.referral_ranking;
CREATE VIEW public.referral_ranking
WITH (security_invoker = on)
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
ORDER BY tickets_sold DESC, total_revenue DESC, sales_count DESC;

COMMENT ON VIEW public.top_buyers_ranking IS 'Ranking of buyers grouped by phone, using most recent name.';
COMMENT ON VIEW public.referral_ranking IS 'Ranking of referrers based on approved tickets sold.';
