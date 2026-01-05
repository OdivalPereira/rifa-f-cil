-- =============================================
-- ENHANCED PIX PAYMENT SYSTEM
-- =============================================

-- 1. Alterar tabela raffles para adicionar campos de segurança e configuração PIX
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS short_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS pix_change_notification_email TEXT,
ADD COLUMN IF NOT EXISTS pix_last_changed_at TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.raffles.short_code IS 'Código curto único para identificação no PIX (ex: ODS2)';
COMMENT ON COLUMN public.raffles.pix_change_notification_email IS 'Email para receber alertas de troca de chave PIX';

-- 2. Alterar tabela purchases para link de comprovante e status de upload
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMP WITH TIME ZONE;

-- 3. Criar tabela de auditoria para mudanças de chave PIX
CREATE TABLE IF NOT EXISTS public.pix_change_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  old_key TEXT,
  new_key TEXT,
  old_key_type TEXT,
  new_key_type TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID REFERENCES auth.users(id), -- Quem fez a alteração
  notification_sent BOOLEAN DEFAULT false
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE public.pix_change_audit ENABLE ROW LEVEL SECURITY;

-- Política: Apenas admins podem ver a auditoria
CREATE POLICY "Admins can view pix audit logs"
ON public.pix_change_audit
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Trigger para detectar mudanças na chave PIX
CREATE OR REPLACE FUNCTION public.audit_pix_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se a chave ou o tipo mudou
  IF (OLD.pix_key IS DISTINCT FROM NEW.pix_key) 
     OR (OLD.pix_key_type IS DISTINCT FROM NEW.pix_key_type) THEN
    
    INSERT INTO public.pix_change_audit (
      raffle_id, 
      old_key, 
      new_key, 
      old_key_type, 
      new_key_type, 
      changed_by
    ) VALUES (
      NEW.id, 
      OLD.pix_key, 
      NEW.pix_key,
      OLD.pix_key_type, 
      NEW.pix_key_type, 
      auth.uid()
    );
    
    -- Atualiza timestamp da última mudança
    NEW.pix_last_changed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover trigger se existir para recriar
DROP TRIGGER IF EXISTS tr_audit_pix_change ON public.raffles;

CREATE TRIGGER tr_audit_pix_change
BEFORE UPDATE ON public.raffles
FOR EACH ROW
EXECUTE FUNCTION public.audit_pix_change();

-- 5. Configurar Storage (Bucket para Comprovantes) via SQL (requer pg_net ou extensão storage, mas faremos via policies)
-- Nota: A criação do bucket geralmente é feita via Dashboard ou Client, mas podemos inserir na tabela `storage.buckets` se tivermos permissão.
-- Assumindo que o bucket 'receipts' será criado manualmente ou já existe. Falharemos graciosamente no frontend se não existir.
-- Vamos tentar criar se não existir (apenas se tiver permissão de admin no DB)

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage para 'receipts'
-- Permitir upload público (qualquer um que tenha a referência, ou autenticado anônimo)
CREATE POLICY "Anyone can upload receipts"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'receipts');

-- Permitir leitura pública (para o admin ver)
CREATE POLICY "Anyone can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- Permitir deleção (para cleanup automático) se for admin ou quem fez upload (embora quem fez upload não seja autenticado as vezes)
-- Vamos permitir que autenticados deletem para o fluxo de admin
CREATE POLICY "Admins can delete receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'receipts' AND public.has_role(auth.uid(), 'admin'));
