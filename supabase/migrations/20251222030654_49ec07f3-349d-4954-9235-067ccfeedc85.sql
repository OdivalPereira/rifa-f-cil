-- Allow admins to update customer_accounts (for PIN reset)
CREATE POLICY "Admins can update customer accounts"
ON public.customer_accounts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));