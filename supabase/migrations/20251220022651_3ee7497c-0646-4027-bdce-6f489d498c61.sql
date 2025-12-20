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
