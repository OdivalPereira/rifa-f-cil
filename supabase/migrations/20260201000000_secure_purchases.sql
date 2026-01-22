-- Create RPC function to securely create purchases
-- This allows us to bypass RLS for insertion and data retrieval for the creator
CREATE OR REPLACE FUNCTION public.create_purchase(
  p_raffle_id UUID,
  p_buyer_name TEXT,
  p_buyer_email TEXT,
  p_buyer_phone TEXT,
  p_quantity INTEGER,
  p_referrer_id UUID DEFAULT NULL,
  p_location TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_price_per_number DECIMAL;
  v_total_amount DECIMAL;
  v_purchase_id UUID;
  v_result jsonb;
BEGIN
  -- Validate inputs
  IF p_quantity <= 0 THEN
    RAISE EXCEPTION 'Quantity must be positive';
  END IF;

  -- Get price from raffle
  SELECT price_per_number INTO v_price_per_number
  FROM public.raffles
  WHERE id = p_raffle_id;

  IF v_price_per_number IS NULL THEN
    RAISE EXCEPTION 'Raffle not found';
  END IF;

  v_total_amount := p_quantity * v_price_per_number;

  -- Insert purchase
  INSERT INTO public.purchases (
    raffle_id,
    buyer_name,
    buyer_email,
    buyer_phone,
    quantity,
    total_amount,
    referrer_id,
    location
  ) VALUES (
    p_raffle_id,
    p_buyer_name,
    p_buyer_email,
    p_buyer_phone,
    p_quantity,
    v_total_amount,
    p_referrer_id,
    p_location
  )
  RETURNING id INTO v_purchase_id;

  -- Return the result
  SELECT to_jsonb(p.*) INTO v_result
  FROM public.purchases p
  WHERE p.id = v_purchase_id;

  RETURN v_result;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.create_purchase TO anon, authenticated;

-- DROP the insecure policy that allows anyone to view all purchases
-- This fixes the CRITICAL Data Leak
DROP POLICY IF EXISTS "Buyers can view own purchases" ON public.purchases;

-- Allow Admins to view all purchases
CREATE POLICY "Admins can view all purchases"
ON public.purchases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Note: We keep the INSERT policy for now to avoid breaking other potential integrations,
-- but the frontend will switch to using create_purchase RPC.
-- Since SELECT policy is dropped, direct INSERTs will not be able to return data,
-- effectively enforcing RPC usage for interactive flows.
