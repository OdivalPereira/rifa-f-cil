-- =============================================
-- FIX: Purchases Table RLS Data Leak
-- =============================================

-- Revoke the permissive policy that allows anyone to view all purchases
-- Previous policy was: USING (true) which leaked all data
DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.purchases;

-- Add a restrictive policy that only allows admins to view all purchases
-- Service Role (Edge Functions) bypasses RLS automatically
CREATE POLICY "Admins can view all purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Note: Anonymous users can still INSERT (create purchases) via "Anyone can create purchases" policy
-- But they can no longer SELECT (view) any purchase, preserving privacy.
-- They must use the secure 'get-my-purchases' Edge Function to view their history.
