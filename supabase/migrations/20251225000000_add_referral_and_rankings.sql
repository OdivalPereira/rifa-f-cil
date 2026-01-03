-- 1. Create function to generate random referral code
CREATE OR REPLACE FUNCTION generate_unique_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
  code_exists BOOLEAN;
BEGIN
  LOOP
    result := '';
    FOR i IN 1..8 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;

    SELECT EXISTS(SELECT 1 FROM customer_accounts WHERE referral_code = result) INTO code_exists;
    IF NOT code_exists THEN
      RETURN result;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 2. Add referral_code to customer_accounts
ALTER TABLE customer_accounts ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- 3. Create trigger to set referral_code on insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_unique_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_set_referral_code ON customer_accounts;
CREATE TRIGGER tr_set_referral_code
BEFORE INSERT ON customer_accounts
FOR EACH ROW
EXECUTE FUNCTION set_referral_code();

-- 4. Add referrer_id to purchases
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES customer_accounts(id);

-- 5. Create View referral_ranking
CREATE OR REPLACE VIEW referral_ranking AS
SELECT
  p.referrer_id,
  p.raffle_id,
  COUNT(p.id) as sales_count,
  SUM(p.quantity) as tickets_sold
FROM purchases p
WHERE p.payment_status = 'approved' AND p.referrer_id IS NOT NULL
GROUP BY p.referrer_id, p.raffle_id
ORDER BY tickets_sold DESC;

-- 6. Create View top_buyers_ranking
CREATE OR REPLACE VIEW top_buyers_ranking AS
SELECT
  p.buyer_phone,
  p.raffle_id,
  SUM(p.quantity) as tickets_bought
FROM purchases p
WHERE p.payment_status = 'approved'
GROUP BY p.buyer_phone, p.raffle_id
ORDER BY tickets_bought DESC;
