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
-- Usuários comuns só veem rifas ativas não excluídas
-- Admins veem todas (incluindo lixeira)
DROP POLICY IF EXISTS "Anyone can view active raffles" ON public.raffles;

CREATE POLICY "Anyone can view active raffles"
ON public.raffles
FOR SELECT
USING (
  (status = 'active' AND deleted_at IS NULL) 
  OR public.has_role(auth.uid(), 'admin')
);

-- 4. Função para cleanup de rifas excluídas há mais de 30 dias
-- Esta função deve ser agendada via pg_cron ou chamada manualmente
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

-- 5. Trigger function para logging de soft delete (opcional, mas útil para auditoria)
CREATE OR REPLACE FUNCTION public.log_raffle_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Loga quando deleted_at muda de NULL para um valor
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    RAISE NOTICE 'Raffle soft deleted: id=%, title=%, deleted_at=%', 
      NEW.id, NEW.title, NEW.deleted_at;
  -- Loga quando rifa é restaurada
  ELSIF OLD.deleted_at IS NOT NULL AND NEW.deleted_at IS NULL THEN
    RAISE NOTICE 'Raffle restored: id=%, title=%', NEW.id, NEW.title;
  END IF;
  RETURN NEW;
END;
$$;

-- Criar trigger para logging
DROP TRIGGER IF EXISTS tr_log_raffle_soft_delete ON public.raffles;
CREATE TRIGGER tr_log_raffle_soft_delete
AFTER UPDATE ON public.raffles
FOR EACH ROW
WHEN (OLD.deleted_at IS DISTINCT FROM NEW.deleted_at)
EXECUTE FUNCTION public.log_raffle_soft_delete();

-- 6. Comentários para documentação
COMMENT ON COLUMN public.raffles.deleted_at IS 'Data de soft delete. NULL = ativa, NOT NULL = na lixeira (será excluída após 30 dias)';
COMMENT ON FUNCTION public.cleanup_deleted_raffles() IS 'Remove permanentemente rifas na lixeira há mais de 30 dias. Retorna quantidade de rifas excluídas.';

-- Nota: Para agendar cleanup automático via pg_cron (se disponível):
-- SELECT cron.schedule('cleanup-deleted-raffles', '0 3 * * *', 'SELECT cleanup_deleted_raffles()');
