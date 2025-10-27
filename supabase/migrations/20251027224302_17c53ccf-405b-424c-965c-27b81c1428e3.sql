-- Habilitar extensiones necesarias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Configurar cron job para ejecutar cada 3 horas
-- El cron job consulta automáticamente las guías pendientes
SELECT cron.schedule(
  'carrier-tracking-auto-update',
  '0 */3 * * *', -- Cada 3 horas en punto
  $$
  SELECT
    net.http_post(
        url:='https://tkwffswlgpzxyyuhdrrp.supabase.co/functions/v1/cron-carrier-tracking',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrd2Zmc3dsZ3B6eHl5dWhkcnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTQ4ODQsImV4cCI6MjA2NTE5MDg4NH0.-jwDQIySNiZbBJIRlwkLBxIGOIQtq6OM5MHwoCDfljA"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Comentario para documentación
COMMENT ON EXTENSION pg_cron IS 'Extensión para ejecutar tareas programadas en PostgreSQL';
