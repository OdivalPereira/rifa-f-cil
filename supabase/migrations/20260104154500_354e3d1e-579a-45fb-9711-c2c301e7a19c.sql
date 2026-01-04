-- ==============================================
-- SISTEMA DE GAMIFICAÇÃO E INDICAÇÕES
-- ==============================================

-- 1. Adicionar colunas de gamificação na tabela raffles
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS prize_referral_1st text,
ADD COLUMN IF NOT EXISTS referral_threshold integer,
ADD COLUMN IF NOT EXISTS prize_buyer_1st text,
ADD COLUMN IF NOT EXISTS prize_referral_runners text,
ADD COLUMN IF NOT EXISTS prize_buyer_runners text;

-- 2. Adicionar coluna referral_code na tabela customer_accounts
ALTER TABLE public.customer_accounts 
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- 3. Adicionar coluna referrer_id na tabela purchases
ALTER TABLE public.purchases 
ADD COLUMN IF NOT EXISTS referrer_id uuid REFERENCES public.customer_accounts(id);

-- 4. Criar índice para performance nas buscas de referral
CREATE INDEX IF NOT EXISTS idx_customer_accounts_referral_code 
ON public.customer_accounts(referral_code);

CREATE INDEX IF NOT EXISTS idx_purchases_referrer_id 
ON public.purchases(referrer_id);

-- 5. Função para gerar código de indicação único
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Gera código de 8 caracteres alfanuméricos
    new_code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    SELECT EXISTS(SELECT 1 FROM customer_accounts WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 6. View para ranking de indicadores (quem mais indicou compras aprovadas)
CREATE OR REPLACE VIEW public.referral_ranking AS
SELECT 
  ca.id as referrer_id,
  ca.phone as referrer_phone,
  ca.referral_code,
  p.raffle_id,
  COUNT(DISTINCT p.id) as sales_count,
  COALESCE(SUM(p.quantity), 0) as tickets_sold,
  COALESCE(SUM(p.total_amount), 0) as total_revenue
FROM public.purchases p
INNER JOIN public.customer_accounts ca ON p.referrer_id = ca.id
WHERE p.payment_status = 'approved'
GROUP BY ca.id, ca.phone, ca.referral_code, p.raffle_id
ORDER BY tickets_sold DESC;

-- 7. View para ranking de compradores (quem mais comprou números)
CREATE OR REPLACE VIEW public.top_buyers_ranking AS
SELECT 
  p.buyer_phone,
  p.buyer_name,
  p.raffle_id,
  COUNT(DISTINCT p.id) as purchase_count,
  COALESCE(SUM(p.quantity), 0) as tickets_bought,
  COALESCE(SUM(p.total_amount), 0) as total_spent
FROM public.purchases p
WHERE p.payment_status = 'approved'
GROUP BY p.buyer_phone, p.buyer_name, p.raffle_id
ORDER BY tickets_bought DESC;

-- 8. Comentários para documentação
COMMENT ON COLUMN public.raffles.prize_referral_1st IS 'Prêmio para o Top Indicador (1º lugar)';
COMMENT ON COLUMN public.raffles.referral_threshold IS 'Meta de vendas para liberar prêmio de indicação';
COMMENT ON COLUMN public.raffles.prize_buyer_1st IS 'Prêmio para o Maior Comprador (1º lugar)';
COMMENT ON COLUMN public.raffles.prize_referral_runners IS 'Prêmio para 2º ao 5º lugar em indicações';
COMMENT ON COLUMN public.raffles.prize_buyer_runners IS 'Prêmio para 2º ao 5º lugar em compras';
COMMENT ON COLUMN public.customer_accounts.referral_code IS 'Código único de indicação do usuário';
COMMENT ON COLUMN public.purchases.referrer_id IS 'ID do usuário que indicou esta compra';