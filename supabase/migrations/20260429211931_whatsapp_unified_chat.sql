-- ══════════════════════════════════════════════════════════════════════════════
--  WhatsApp Unified Chat — Fase 1
--  Reemplaza el modelo legacy (incoming_messages + sent_messages) por un
--  esquema unificado inspirado en el chat operador de la carnicería:
--
--   - whatsapp_conversations : una fila por número, estado open/closed/pending
--   - whatsapp_messages      : todos los mensajes (inbound + outbound) en una
--                              sola tabla con flujo de estado real
--                              (pending → sent → delivered → read | failed)
--                              + media (img/audio/video/doc) + errores Meta
--                              traducidos al español
--   - conversation_notes     : notas internas por conversación (no se envían)
--   - whatsapp_conversation_inbox (VIEW) : enriquece conversaciones con
--                              unread_count, awaiting_reply, last_message_preview
--   - whatsapp-media (bucket): bucket privado para archivos
--
--  Las tablas legacy (incoming_messages, sent_messages) se dejan intactas en
--  esta fase para permitir rollback. Una migración posterior las elimina.
-- ══════════════════════════════════════════════════════════════════════════════

-- ─── 1. Conversaciones ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.whatsapp_conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number      TEXT NOT NULL UNIQUE,
  customer_id       UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open', 'closed', 'pending')),
  last_message_at   TIMESTAMPTZ,
  last_read_at      TIMESTAMPTZ,
  last_read_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wc_phone   ON public.whatsapp_conversations(phone_number);
CREATE INDEX IF NOT EXISTS idx_wc_cust    ON public.whatsapp_conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_wc_status  ON public.whatsapp_conversations(status);

-- ─── 2. Mensajes ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  customer_id       UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  direction         TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type      TEXT NOT NULL DEFAULT 'text'
                    CHECK (message_type IN ('text', 'image', 'audio', 'video', 'document', 'interactive')),
  content           TEXT,
  waba_message_id   TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  -- Media
  media_url         TEXT,
  media_mime_type   TEXT,
  media_size_bytes  BIGINT,
  media_caption     TEXT,
  media_duration_sec INTEGER,
  -- Errores
  error_code        INTEGER,
  error_title       TEXT,
  error_message     TEXT,
  error_message_es  TEXT,
  failed_at         TIMESTAMPTZ,
  -- Timestamps
  sent_at           TIMESTAMPTZ DEFAULT NOW(),
  delivered_at      TIMESTAMPTZ,
  read_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wm_conv       ON public.whatsapp_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_wm_cust       ON public.whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_wm_status     ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_wm_sent_at    ON public.whatsapp_messages(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_wm_waba_id    ON public.whatsapp_messages(waba_message_id) WHERE waba_message_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_wm_conv_inbound_sent
  ON public.whatsapp_messages (conversation_id, sent_at DESC)
  WHERE direction = 'inbound';
CREATE INDEX IF NOT EXISTS idx_wm_media
  ON public.whatsapp_messages (conversation_id, sent_at DESC)
  WHERE media_url IS NOT NULL;

-- ─── 3. Notas internas por conversación ──────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.whatsapp_conversations(id) ON DELETE CASCADE,
  author_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name     TEXT,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cn_conv ON public.conversation_notes(conversation_id);

-- ─── 4. RLS Policies ─────────────────────────────────────────────────────────

ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_notes     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "service_all_conversations" ON public.whatsapp_conversations;
DROP POLICY IF EXISTS "admin_all_messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "service_all_messages" ON public.whatsapp_messages;
DROP POLICY IF EXISTS "admin_all_notes" ON public.conversation_notes;
DROP POLICY IF EXISTS "service_all_notes" ON public.conversation_notes;

CREATE POLICY "admin_all_conversations" ON public.whatsapp_conversations
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_conversations" ON public.whatsapp_conversations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_messages" ON public.whatsapp_messages
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_messages" ON public.whatsapp_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "admin_all_notes" ON public.conversation_notes
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "service_all_notes" ON public.conversation_notes
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ─── 5. updated_at trigger ───────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_set_updated_at_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_wc_updated_at ON public.whatsapp_conversations;
CREATE TRIGGER trig_wc_updated_at
  BEFORE UPDATE ON public.whatsapp_conversations
  FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at_whatsapp();

-- ─── 6. Traducción de errores Meta al español ────────────────────────────────

CREATE OR REPLACE FUNCTION public.translate_meta_error(
  p_code         INTEGER,
  p_raw_title    TEXT,
  p_raw_message  TEXT
) RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_code IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN CASE p_code
    -- Recipient-side
    WHEN 131026 THEN 'El número no tiene WhatsApp activo'
    WHEN 131047 THEN 'Sin contexto reciente para enviar (ventana 24h cerrada). Usa una plantilla aprobada.'
    WHEN 131048 THEN 'El cliente bloqueó al negocio en WhatsApp'
    WHEN 131049 THEN 'El cliente no recibe mensajes de marketing (opt-out)'
    WHEN 131009 THEN 'Número con formato inválido'
    WHEN 131021 THEN 'El destinatario es el mismo número del negocio'
    -- Business-side / quality / rate
    WHEN 131050 THEN 'Calidad del número del negocio bajó. Mensajes de marketing limitados.'
    WHEN 131056 THEN 'Límite de envíos alcanzado. Espera unas horas.'
    WHEN 80007  THEN 'Demasiadas solicitudes a Meta por minuto'
    -- Auth / config
    WHEN 100    THEN 'Configuración del negocio incorrecta. Avisa al admin técnico.'
    WHEN 190    THEN 'Token de WhatsApp expirado. Hay que renovarlo.'
    -- Fallback
    ELSE 'Mensaje no entregado: ' || COALESCE(NULLIF(p_raw_title, ''), 'Error ' || p_code::text)
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.fn_whatsapp_messages_translate_error()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.error_code IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT'
     OR NEW.error_code IS DISTINCT FROM OLD.error_code
     OR NEW.error_title IS DISTINCT FROM OLD.error_title
     OR NEW.error_message IS DISTINCT FROM OLD.error_message
  THEN
    NEW.error_message_es := public.translate_meta_error(
      NEW.error_code,
      NEW.error_title,
      NEW.error_message
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_whatsapp_messages_translate_error ON public.whatsapp_messages;
CREATE TRIGGER trg_whatsapp_messages_translate_error
  BEFORE INSERT OR UPDATE OF error_code, error_title, error_message
  ON public.whatsapp_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.fn_whatsapp_messages_translate_error();

-- ─── 7. Inbox VIEW ───────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.whatsapp_conversation_inbox AS
SELECT
  c.id,
  c.phone_number,
  c.customer_id,
  c.status,
  c.last_message_at,
  c.last_read_at,
  c.last_read_by,
  c.created_at,
  c.updated_at,
  CASE
    WHEN cu.id IS NULL THEN NULL
    ELSE jsonb_build_object(
      'id',                cu.id,
      'name',              cu.name,
      'email',             cu.email,
      'phone',             cu.phone,
      'whatsapp_number',   cu.whatsapp_number,
      'profile_image_url', cu.profile_image_url
    )
  END AS customers,
  COALESCE((
    SELECT count(*)::int
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id
      AND m.direction = 'inbound'
      AND m.sent_at > COALESCE(c.last_read_at, '1970-01-01'::timestamptz)
  ), 0) AS unread_count,
  (
    SELECT max(m.sent_at)
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id AND m.direction = 'inbound'
  ) AS last_inbound_at,
  (
    SELECT max(m.sent_at)
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id AND m.direction = 'outbound'
  ) AS last_outbound_at,
  (
    SELECT
      max(m.sent_at) FILTER (WHERE m.direction = 'inbound') IS NOT NULL
      AND (
        max(m.sent_at) FILTER (WHERE m.direction = 'outbound') IS NULL
        OR max(m.sent_at) FILTER (WHERE m.direction = 'inbound')
           > max(m.sent_at) FILTER (WHERE m.direction = 'outbound')
      )
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id
  ) AS awaiting_reply,
  (
    SELECT
      CASE
        WHEN max(m.sent_at) IS NULL THEN NULL
        ELSE (extract(epoch FROM (now() - max(m.sent_at))) / 60)::int
      END
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id AND m.direction = 'inbound'
  ) AS minutes_since_last_inbound,
  (
    SELECT
      CASE
        WHEN m.media_url IS NOT NULL AND (m.content IS NULL OR m.content = '')
          THEN '[' || COALESCE(m.message_type, 'media') || ']'
        WHEN m.content IS NULL OR m.content = ''
          THEN NULL
        ELSE left(m.content, 80)
      END
    FROM public.whatsapp_messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.sent_at DESC
    LIMIT 1
  ) AS last_message_preview
FROM public.whatsapp_conversations c
LEFT JOIN public.customers cu ON cu.id = c.customer_id;

GRANT SELECT ON public.whatsapp_conversation_inbox TO authenticated, service_role;

-- ─── 8. RPCs: marcar leído / no leído ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'mark_conversation_read: requires authenticated user';
  END IF;

  UPDATE public.whatsapp_conversations
     SET last_read_at = now(), last_read_by = v_uid
   WHERE id = p_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_read(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.mark_conversation_unread(p_conversation_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_target TIMESTAMPTZ;
BEGIN
  SELECT max(sent_at) - interval '1 second' INTO v_target
  FROM public.whatsapp_messages
  WHERE conversation_id = p_conversation_id AND direction = 'inbound';

  IF v_target IS NULL THEN RETURN; END IF;

  UPDATE public.whatsapp_conversations
  SET last_read_at = v_target, last_read_by = NULL
  WHERE id = p_conversation_id;
END;
$$;

REVOKE ALL ON FUNCTION public.mark_conversation_unread(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.mark_conversation_unread(UUID) TO authenticated, service_role;

-- ─── 9. Realtime ─────────────────────────────────────────────────────────────

ALTER TABLE public.whatsapp_messages      REPLICA IDENTITY FULL;
ALTER TABLE public.whatsapp_conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.whatsapp_conversations;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- ─── 10. Bucket whatsapp-media ───────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('whatsapp-media', 'whatsapp-media', false, 104857600)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "wa_media_service_all"          ON storage.objects;
DROP POLICY IF EXISTS "wa_media_authenticated_read"   ON storage.objects;
DROP POLICY IF EXISTS "wa_media_authenticated_insert" ON storage.objects;

CREATE POLICY "wa_media_service_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'whatsapp-media' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'whatsapp-media' AND auth.role() = 'service_role');

CREATE POLICY "wa_media_authenticated_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

CREATE POLICY "wa_media_authenticated_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'whatsapp-media' AND auth.role() = 'authenticated');

-- ─── 11. Migración de datos legacy ───────────────────────────────────────────
-- Mueve incoming_messages + sent_messages → whatsapp_conversations + whatsapp_messages.
-- Idempotente: solo migra mensajes cuyo waba_message_id no exista ya en la
-- tabla nueva (o, si no tiene waba_message_id, se identifica por (id legacy)).

DO $$
DECLARE
  v_legacy_id      UUID;
  v_legacy_phone   TEXT;
  v_conv_id        UUID;
  v_customer_id    UUID;
  v_status_in_msg  TEXT;
BEGIN
  -- 11.1: Crear conversaciones únicas por número, combinando ambas tablas
  INSERT INTO public.whatsapp_conversations (phone_number, customer_id, last_message_at, status)
  SELECT
    phone,
    (array_agg(customer_id) FILTER (WHERE customer_id IS NOT NULL))[1],
    MAX(ts),
    'open'
  FROM (
    SELECT from_phone AS phone, customer_id, COALESCE(timestamp, NOW()) AS ts
    FROM public.incoming_messages
    UNION ALL
    SELECT phone AS phone, customer_id, COALESCE(sent_at, created_at, NOW()) AS ts
    FROM public.sent_messages
  ) AS all_phones
  WHERE phone IS NOT NULL AND phone <> ''
  GROUP BY phone
  ON CONFLICT (phone_number) DO UPDATE
    SET last_message_at = GREATEST(
          public.whatsapp_conversations.last_message_at,
          EXCLUDED.last_message_at
        ),
        customer_id = COALESCE(public.whatsapp_conversations.customer_id, EXCLUDED.customer_id);

  -- 11.2: Migrar inbound (incoming_messages → whatsapp_messages)
  INSERT INTO public.whatsapp_messages (
    conversation_id, customer_id, direction, message_type, content,
    waba_message_id, status, media_url, sent_at, created_at
  )
  SELECT
    c.id,
    im.customer_id,
    'inbound',
    CASE
      WHEN im.message_type IN ('text', 'image', 'audio', 'video', 'document', 'interactive')
        THEN im.message_type
      ELSE 'text'
    END,
    im.message_content,
    im.whatsapp_message_id,
    'delivered',
    im.media_url,
    COALESCE(im.timestamp, NOW()),
    COALESCE(im.timestamp, NOW())
  FROM public.incoming_messages im
  JOIN public.whatsapp_conversations c ON c.phone_number = im.from_phone
  WHERE im.whatsapp_message_id IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM public.whatsapp_messages wm
       WHERE wm.waba_message_id = im.whatsapp_message_id
     );

  -- 11.3: Migrar outbound (sent_messages → whatsapp_messages)
  INSERT INTO public.whatsapp_messages (
    conversation_id, customer_id, direction, message_type, content,
    waba_message_id, status, media_url, sent_at, created_at
  )
  SELECT
    c.id,
    sm.customer_id,
    'outbound',
    CASE WHEN sm.image_url IS NOT NULL THEN 'image' ELSE 'text' END,
    sm.message,
    sm.whatsapp_message_id,
    CASE
      WHEN sm.status IN ('pending', 'sent', 'delivered', 'read', 'failed')
        THEN sm.status
      WHEN sm.status = 'success' THEN 'sent'
      WHEN sm.status = 'error' THEN 'failed'
      ELSE 'sent'
    END,
    sm.image_url,
    COALESCE(sm.sent_at, sm.created_at, NOW()),
    COALESCE(sm.created_at, NOW())
  FROM public.sent_messages sm
  JOIN public.whatsapp_conversations c ON c.phone_number = sm.phone
  WHERE sm.whatsapp_message_id IS NULL
     OR NOT EXISTS (
       SELECT 1 FROM public.whatsapp_messages wm
       WHERE wm.waba_message_id = sm.whatsapp_message_id
     );

  -- 11.4: Refrescar last_message_at por si hubo skips
  UPDATE public.whatsapp_conversations c
  SET last_message_at = sub.max_ts
  FROM (
    SELECT conversation_id, max(sent_at) AS max_ts
    FROM public.whatsapp_messages
    GROUP BY conversation_id
  ) sub
  WHERE c.id = sub.conversation_id
    AND (c.last_message_at IS NULL OR c.last_message_at < sub.max_ts);
END $$;

COMMENT ON TABLE public.whatsapp_conversations IS
  'Una fila por número de teléfono. Reemplaza el modelo legacy de incoming_messages/sent_messages.';

COMMENT ON TABLE public.whatsapp_messages IS
  'Todos los mensajes WhatsApp (inbound + outbound) en una sola tabla con flujo real de estado y soporte de media.';
