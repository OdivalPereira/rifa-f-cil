-- Secure purchases table by removing public access
-- This fixes a Critical vulnerability where ANYONE could select all purchases because of USING (true)

DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.purchases;

-- Ensure no other public SELECT policies exist
-- (Existing "Admins can update purchases" handles UPDATE)
-- (Existing "Anyone can create purchases" handles INSERT)

-- Now SELECT is denied for 'anon' and 'authenticated' (unless they are admin? No, admin check is in other policies)
-- Admins need to see purchases?
-- "Admins can update purchases" allows UPDATE.
-- Do Admins have a SELECT policy?

-- Let's check full_schema.sql for Admin SELECT on purchases.
-- There isn't one!
-- Wait, if there is NO SELECT policy, Admins (who are "authenticated" users with role claim or just role in table) cannot SELECT either!
-- Unless they use Service Role (dashboard uses service role? No, dashboard uses authenticated client).

-- So I MUST add a policy for Admins to SELECT.
-- The app has an Admin Dashboard. It definitely lists purchases.

-- Let's look at `full_schema.sql` again.
-- Line 169: "Admins can update purchases" -> FOR UPDATE.
-- There is NO "Admins can select purchases".
-- BECAUSE "Buyers can view own purchases" was `USING (true)`, which allowed Admins (and everyone else) to see everything.
-- So I must add a policy for Admins.

CREATE POLICY "Admins can view all purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
