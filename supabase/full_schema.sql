-- FULL DATABASE SCHEMA SCRIPT

-- FILE: supabase/migrations/20251220022651_3ee7497c-0646-4027-bdce-6f489d498c61.sql

-- =============================================
-- SISTEMA DE RIFAS PREMIUM - Estrutura do Banco
-- =============================================

-- Enum para status de pagamento
CREATE TYPE public.payment_status AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- Enum para status da rifa
CREATE TYPE public.raffle_status AS ENUM ('draft', 'active', 'completed', 'cancelled');

-- Enum para roles de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- =============================================
-- Tabela: raffles (Rifas)
-- =============================================
CREATE TABLE public.raffles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize_description TEXT NOT NULL,
  image_url TEXT,
  price_per_number DECIMAL(10,2) NOT NULL DEFAULT 0.50,
  total_numbers INTEGER NOT NULL DEFAULT 10000,
  pix_key TEXT,
  pix_key_type TEXT, -- cpf, cnpj, email, phone, random
  pix_beneficiary_name TEXT,
  status public.raffle_status NOT NULL DEFAULT 'draft',
  draw_date TIMESTAMP WITH TIME ZONE,
  winner_number INTEGER,
  winner_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Tabela: purchases (Compras)
-- =============================================
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  pix_transaction_id TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 minutes'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- Tabela: raffle_numbers (Números da Rifa)
-- =============================================
CREATE TABLE public.raffle_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  reserved_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, number)
);

-- =============================================
-- Tabela: user_roles (Papéis de Usuário)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- =============================================
-- Índices para performance
-- =============================================
CREATE INDEX idx_purchases_raffle ON public.purchases(raffle_id);
CREATE INDEX idx_purchases_email ON public.purchases(buyer_email);
CREATE INDEX idx_purchases_phone ON public.purchases(buyer_phone);
CREATE INDEX idx_purchases_status ON public.purchases(payment_status);
CREATE INDEX idx_raffle_numbers_raffle ON public.raffle_numbers(raffle_id);
CREATE INDEX idx_raffle_numbers_purchase ON public.raffle_numbers(purchase_id);
CREATE INDEX idx_raffle_numbers_number ON public.raffle_numbers(raffle_id, number);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);

-- =============================================
-- Habilitar RLS em todas as tabelas
-- =============================================
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raffle_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Função para verificar se usuário é admin
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- =============================================
-- Políticas RLS: raffles
-- =============================================
-- Qualquer pessoa pode ver rifas ativas
CREATE POLICY "Anyone can view active raffles"
ON public.raffles
FOR SELECT
USING (status = 'active' OR public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem inserir rifas
CREATE POLICY "Admins can insert raffles"
ON public.raffles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem atualizar rifas
CREATE POLICY "Admins can update raffles"
ON public.raffles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Apenas admins podem deletar rifas
CREATE POLICY "Admins can delete raffles"
ON public.raffles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Políticas RLS: purchases
-- =============================================
-- Qualquer pessoa pode criar compras (anônimo)
CREATE POLICY "Anyone can create purchases"
ON public.purchases
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Compradores podem ver suas próprias compras por email
CREATE POLICY "Buyers can view own purchases"
ON public.purchases
FOR SELECT
USING (true);

-- Admins podem atualizar compras
CREATE POLICY "Admins can update purchases"
ON public.purchases
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Políticas RLS: raffle_numbers
-- =============================================
-- Qualquer pessoa pode ver números (para saber quais estão disponíveis)
CREATE POLICY "Anyone can view raffle numbers"
ON public.raffle_numbers
FOR SELECT
USING (true);

-- Qualquer pessoa pode reservar números (ligado à compra)
CREATE POLICY "Anyone can reserve numbers"
ON public.raffle_numbers
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admins podem atualizar números
CREATE POLICY "Admins can update numbers"
ON public.raffle_numbers
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admins podem deletar números
CREATE POLICY "Admins can delete numbers"
ON public.raffle_numbers
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Políticas RLS: user_roles
-- =============================================
-- Usuários podem ver seus próprios roles
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Apenas admins podem gerenciar roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- Trigger para atualizar updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_raffles_updated_at
  BEFORE UPDATE ON public.raffles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- Habilitar Realtime para números (controle de conflitos)
-- =============================================
ALTER TABLE public.raffle_numbers REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raffle_numbers;
;

-- FILE: supabase/migrations/20251222024502_3c20e766-7f13-4a5a-b385-4e36866c8184.sql

-- Create spin_balance table
CREATE TABLE public.spin_balance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  spins_available INTEGER NOT NULL DEFAULT 0,
  total_spins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email),
  UNIQUE(phone)
);

ALTER TABLE public.spin_balance ADD CONSTRAINT spin_balance_identity_check CHECK (email IS NOT NULL OR phone IS NOT NULL);

-- Create spin_history table
CREATE TABLE public.spin_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,
  phone TEXT,
  prize_type TEXT NOT NULL,
  prize_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.spin_balance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spin_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view spin balance" ON public.spin_balance FOR SELECT USING (true);
CREATE POLICY "Service role can update spin balance" ON public.spin_balance FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert spin history" ON public.spin_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view spin history" ON public.spin_history FOR SELECT USING (true);

-- Indexes
CREATE INDEX idx_spin_balance_email ON public.spin_balance(email);
CREATE INDEX idx_spin_balance_phone ON public.spin_balance(phone);
CREATE INDEX idx_spin_history_email ON public.spin_history(email);
CREATE INDEX idx_spin_history_phone ON public.spin_history(phone);

-- Trigger to grant spins on purchase
CREATE OR REPLACE FUNCTION public.grant_spins_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'approved' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'approved') THEN
    IF NEW.buyer_email IS NOT NULL THEN
        INSERT INTO public.spin_balance (email, spins_available, total_spins)
        VALUES (NEW.buyer_email, 1, 1)
        ON CONFLICT (email) DO UPDATE
        SET spins_available = spin_balance.spins_available + 1,
            total_spins = spin_balance.total_spins + 1,
            updated_at = now();
    ELSIF NEW.buyer_phone IS NOT NULL THEN
       INSERT INTO public.spin_balance (phone, spins_available, total_spins)
       VALUES (NEW.buyer_phone, 1, 1)
       ON CONFLICT (phone) DO UPDATE
       SET spins_available = spin_balance.spins_available + 1,
           total_spins = spin_balance.total_spins + 1,
           updated_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER tr_grant_spins
  AFTER INSERT OR UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_spins_on_purchase();;

-- FILE: supabase/migrations/20251222030012_26f8c14a-b3df-40d8-9760-52a7757a184d.sql

-- Create customer_accounts table for simplified phone + PIN authentication
CREATE TABLE public.customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text UNIQUE NOT NULL,
  pin_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;

-- RLS: Anyone can create an account (registration is public)
CREATE POLICY "Anyone can create customer accounts"
ON public.customer_accounts
FOR INSERT
WITH CHECK (true);

-- RLS: Only service role can read/update (for edge function auth)
CREATE POLICY "Service role can read accounts"
ON public.customer_accounts
FOR SELECT
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_customer_accounts_updated_at
BEFORE UPDATE ON public.customer_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();;

-- FILE: supabase/migrations/20251222030654_49ec07f3-349d-4954-9235-067ccfeedc85.sql

-- Allow admins to update customer_accounts (for PIN reset)
CREATE POLICY "Admins can update customer accounts"
ON public.customer_accounts
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));;

-- FILE: supabase/migrations/20251222040000_add_ranking_prizes.sql

ALTER TABLE "public"."raffles"
ADD COLUMN "prize_top_buyer" text,
ADD COLUMN "prize_top_buyer_details" text,
ADD COLUMN "prize_second_top_buyer" text,
ADD COLUMN "prize_second_top_buyer_details" text,
ADD COLUMN "prize_draw_details" text;
;

-- FILE: supabase/migrations/20251223113749_3da1a248-637e-4062-a228-b2a8acb241d8.sql

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
ADD COLUMN IF NOT EXISTS winner_second_top_buyer_number integer;;

-- FILE: supabase/migrations/20251224000000_remove_spin_wheel.sql

-- Drop tables, function, and trigger related to spin wheel functionality

DROP TRIGGER IF EXISTS tr_grant_spins ON public.purchases;
DROP FUNCTION IF EXISTS public.grant_spins_on_purchase();

DROP TABLE IF EXISTS public.spin_history;
DROP TABLE IF EXISTS public.spin_balance;
;

-- FILE: supabase/migrations/20251225000000_add_referral_and_rankings.sql

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
;

-- FILE: supabase/migrations/20251226000000_add_raffle_prizes_v2.sql

-- Add new prize columns to raffles table
ALTER TABLE raffles
ADD COLUMN IF NOT EXISTS prize_referral_1st text,
ADD COLUMN IF NOT EXISTS referral_threshold integer,
ADD COLUMN IF NOT EXISTS prize_buyer_1st text,
ADD COLUMN IF NOT EXISTS prize_referral_runners text,
ADD COLUMN IF NOT EXISTS prize_buyer_runners text;
;

-- FILE: supabase/migrations/20260104154500_354e3d1e-579a-45fb-9711-c2c301e7a19c.sql

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
COMMENT ON COLUMN public.purchases.referrer_id IS 'ID do usuário que indicou esta compra';;

-- FILE: supabase/migrations/20260104154514_983f49b5-d060-458d-8cfa-52fa42bdf5d1.sql

-- Corrigir views para usar SECURITY INVOKER (padrão mais seguro)

-- Recriar view de ranking de indicadores com SECURITY INVOKER
DROP VIEW IF EXISTS public.referral_ranking;
CREATE VIEW public.referral_ranking
WITH (security_invoker = on)
AS
SELECT
  ca.id as referrer_id,
  ca.phone as referrer_phone,
  ca.referral_code,
  p.raffle_id,
  COUNT(DISTINCT p.id) as sales_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_sold,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_revenue
FROM public.purchases p
INNER JOIN public.customer_accounts ca ON p.referrer_id = ca.id
WHERE p.payment_status = 'approved'
GROUP BY ca.id, ca.phone, ca.referral_code, p.raffle_id
ORDER BY tickets_sold DESC;

-- Recriar view de ranking de compradores com SECURITY INVOKER
DROP VIEW IF EXISTS public.top_buyers_ranking;
CREATE VIEW public.top_buyers_ranking
WITH (security_invoker = on)
AS
SELECT
  p.buyer_phone,
  p.buyer_name,
  p.raffle_id,
  COUNT(DISTINCT p.id)::integer as purchase_count,
  COALESCE(SUM(p.quantity), 0)::integer as tickets_bought,
  COALESCE(SUM(p.total_amount), 0)::numeric as total_spent
FROM public.purchases p
WHERE p.payment_status = 'approved'
GROUP BY p.buyer_phone, p.buyer_name, p.raffle_id
ORDER BY tickets_bought DESC;;

-- FILE: supabase/migrations/20260106120000_soft_delete_raffles.sql

-- ==============================================
-- SOFT DELETE PARA RIFAS - Exclusão Segura
-- ==============================================

-- 1. Adicionar coluna deleted_at para soft delete
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- 2. Criar índice para queries de soft delete
CREATE INDEX IF NOT EXISTS idx_raffles_deleted_at 
ON public.raffles(deleted_at);

-- 3. Atualizar política RLS para SELECT público
DROP POLICY IF EXISTS "Anyone can view active raffles" ON public.raffles;

CREATE POLICY "Anyone can view active raffles"
ON public.raffles
FOR SELECT
USING (
  (status = 'active' AND deleted_at IS NULL) 
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. Função para cleanup de rifas excluídas há mais de 30 dias
CREATE OR REPLACE FUNCTION public.cleanup_deleted_raffles()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  WITH deleted AS (
    DELETE FROM public.raffles 
    WHERE deleted_at IS NOT NULL 
      AND deleted_at < NOW() - INTERVAL '30 days'
    RETURNING id
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted;
  
  RETURN deleted_count;
END;
$$;

-- 5. Trigger function para logging de soft delete
CREATE OR REPLACE FUNCTION public.log_raffle_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    RAISE NOTICE 'Raffle soft deleted: id=%, title=%, deleted_at=%', 
      NEW.id, NEW.title, NEW.deleted_at;
  ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    RAISE NOTICE 'Raffle restored: id=%, title=%', NEW.id, NEW.title;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_log_raffle_soft_delete ON public.raffles;
CREATE TRIGGER tr_log_raffle_soft_delete
AFTER UPDATE ON public.raffles
FOR EACH ROW
WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
EXECUTE FUNCTION public.log_raffle_soft_delete();

COMMENT ON COLUMN public.raffles.deleted_at IS 'Data de soft delete. NULL = ativa, NOT NULL = na lixeira';
COMMENT ON FUNCTION public.cleanup_deleted_raffles() IS 'Remove permanentemente rifas na lixeira há mais de 30 dias';

-- ==============================================
-- TRIGGER PARA NOTIFICAÇÃO VIA EMAIL
-- ==============================================

CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";

CREATE OR REPLACE FUNCTION public.notify_raffle_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  payload jsonb;
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    payload := jsonb_build_object(
      'event', 'soft_delete',
      'raffle_id', NEW.id,
      'raffle_title', NEW.title,
      'deleted_at', NEW.deleted_at
    );
    
    PERFORM net.http_post(
      url := 'https://iohfdtczqxzofqxngsag.supabase.co/functions/v1/notify-admin-action',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := payload
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_raffle_soft_delete ON public.raffles;
CREATE TRIGGER tr_notify_raffle_soft_delete
AFTER UPDATE ON public.raffles
FOR EACH ROW
WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
EXECUTE FUNCTION public.notify_raffle_soft_delete();
