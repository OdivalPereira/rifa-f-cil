-- Migration: Add location column and create social proof RPC function
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Step 1: Add location column to purchases table
ALTER TABLE public.purchases ADD COLUMN IF NOT EXISTS location text;

-- Add comment explaining the column
COMMENT ON COLUMN public.purchases.location IS 'User location captured during purchase (format: City/UF)';

-- Step 2: Create the privacy-protecting RPC function
CREATE OR REPLACE FUNCTION public.get_recent_purchases_public()
RETURNS TABLE (
  display_name text,
  initials text,
  location text,
  quantity integer,
  created_at timestamptz
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
  name_parts text[];
  abbreviated text;
  first_name text;
BEGIN
  FOR rec IN 
    SELECT 
      p.buyer_name,
      p.location as loc,
      p.quantity as qty,
      p.created_at as ts
    FROM purchases p
    WHERE p.payment_status = 'approved'
    ORDER BY p.created_at DESC
    LIMIT 15
  LOOP
    -- Parse name into parts
    name_parts := string_to_array(trim(rec.buyer_name), ' ');
    first_name := name_parts[1];
    
    -- Build abbreviated name: "Odival Martins Pereira" -> "Odival M. P."
    IF array_length(name_parts, 1) = 1 THEN
      abbreviated := first_name;
    ELSE
      abbreviated := first_name;
      FOR i IN 2..array_length(name_parts, 1) LOOP
        abbreviated := abbreviated || ' ' || upper(left(name_parts[i], 1)) || '.';
      END LOOP;
    END IF;
    
    -- Return row with sanitized data
    display_name := abbreviated;
    
    -- Generate initials (first letter of first two names)
    initials := upper(left(first_name, 1));
    IF array_length(name_parts, 1) > 1 THEN
      initials := initials || upper(left(name_parts[2], 1));
    END IF;
    
    location := rec.loc;
    quantity := rec.qty::integer;
    created_at := rec.ts;
    
    RETURN NEXT;
  END LOOP;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.get_recent_purchases_public() TO anon;
GRANT EXECUTE ON FUNCTION public.get_recent_purchases_public() TO authenticated;

-- Test the function (optional - run to verify)
-- SELECT * FROM get_recent_purchases_public();
