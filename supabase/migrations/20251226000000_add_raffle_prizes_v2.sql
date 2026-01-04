-- Add new prize columns to raffles table
ALTER TABLE raffles
ADD COLUMN IF NOT EXISTS prize_referral_1st text,
ADD COLUMN IF NOT EXISTS referral_threshold integer,
ADD COLUMN IF NOT EXISTS prize_buyer_1st text,
ADD COLUMN IF NOT EXISTS prize_referral_runners text,
ADD COLUMN IF NOT EXISTS prize_buyer_runners text;
