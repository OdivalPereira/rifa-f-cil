-- Adicionar colunas para múltiplos prêmios na tabela raffles
ALTER TABLE public.raffles
ADD COLUMN IF NOT EXISTS prize_draw_details text,
ADD COLUMN IF NOT EXISTS prize_top_buyer text,
ADD COLUMN IF NOT EXISTS prize_top_buyer_details text,
ADD COLUMN IF NOT EXISTS prize_second_top_buyer text,
ADD COLUMN IF NOT EXISTS prize_second_top_buyer_details text,
ADD COLUMN IF NOT EXISTS winner_top_buyer_name text,
ADD COLUMN IF NOT EXISTS winner_top_buyer_number integer,
ADD COLUMN IF NOT EXISTS winner_second_top_buyer_name text,
ADD COLUMN IF NOT EXISTS winner_second_top_buyer_number integer;