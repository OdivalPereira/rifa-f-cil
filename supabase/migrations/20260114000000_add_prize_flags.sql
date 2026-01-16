-- Add boolean flags to toggle optional prizes
ALTER TABLE raffles
ADD COLUMN IF NOT EXISTS enable_referral_1st BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_referral_runners BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_buyer_1st BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS enable_buyer_runners BOOLEAN DEFAULT false;

COMMENT ON COLUMN raffles.enable_referral_1st IS 'Habilita a exibição do prêmio para o maior indicador';
COMMENT ON COLUMN raffles.enable_referral_runners IS 'Habilita a exibição do prêmio para indicadores secundários (2º ao 5º)';
COMMENT ON COLUMN raffles.enable_buyer_1st IS 'Habilita a exibição do prêmio para o maior comprador';
COMMENT ON COLUMN raffles.enable_buyer_runners IS 'Habilita a exibição do prêmio para compradores secundários (2º ao 5º)';
