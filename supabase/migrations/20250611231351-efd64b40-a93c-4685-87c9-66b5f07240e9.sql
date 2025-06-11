
-- Paso 1: Crear una tabla temporal para identificar los clientes a mantener
CREATE TEMP TABLE customers_to_keep AS
WITH duplicated_customers AS (
  SELECT 
    name,
    email,
    COUNT(*) as count,
    MAX(updated_at) as latest_update
  FROM public.customers 
  GROUP BY name, email
  HAVING COUNT(*) > 1
)
SELECT DISTINCT ON (c.name, c.email) 
  c.id,
  c.name,
  c.email
FROM public.customers c
INNER JOIN duplicated_customers dc ON c.name = dc.name AND c.email = dc.email
WHERE c.updated_at = dc.latest_update
ORDER BY c.name, c.email, c.updated_at DESC;

-- Paso 2: Crear tabla temporal para clientes duplicados a eliminar
CREATE TEMP TABLE customers_to_delete AS
SELECT c.id
FROM public.customers c
WHERE EXISTS (
  SELECT 1 FROM customers_to_keep ctk 
  WHERE ctk.name = c.name AND ctk.email = c.email
)
AND c.id NOT IN (SELECT id FROM customers_to_keep);

-- Paso 3: Actualizar referencias en paquetes antes de eliminar
UPDATE public.packages 
SET customer_id = (
  SELECT ctk.id 
  FROM customers_to_keep ctk
  INNER JOIN public.customers c_old ON c_old.id = packages.customer_id
  WHERE ctk.name = c_old.name AND ctk.email = c_old.email
  LIMIT 1
)
WHERE customer_id IN (SELECT id FROM customers_to_delete);

-- Paso 4: Actualizar referencias en mensajes entrantes
UPDATE public.incoming_messages 
SET customer_id = (
  SELECT ctk.id 
  FROM customers_to_keep ctk
  INNER JOIN public.customers c_old ON c_old.id = incoming_messages.customer_id
  WHERE ctk.name = c_old.name AND ctk.email = c_old.email
  LIMIT 1
)
WHERE customer_id IN (SELECT id FROM customers_to_delete);

-- Paso 5: Actualizar referencias en mensajes enviados
UPDATE public.sent_messages 
SET customer_id = (
  SELECT ctk.id 
  FROM customers_to_keep ctk
  INNER JOIN public.customers c_old ON c_old.id = sent_messages.customer_id
  WHERE ctk.name = c_old.name AND ctk.email = c_old.email
  LIMIT 1
)
WHERE customer_id IN (SELECT id FROM customers_to_delete);

-- Paso 6: Actualizar referencias en notification_log
UPDATE public.notification_log 
SET customer_id = (
  SELECT ctk.id 
  FROM customers_to_keep ctk
  INNER JOIN public.customers c_old ON c_old.id = notification_log.customer_id
  WHERE ctk.name = c_old.name AND ctk.email = c_old.email
  LIMIT 1
)
WHERE customer_id IN (SELECT id FROM customers_to_delete);

-- Paso 7: Eliminar clientes duplicados
DELETE FROM public.customers 
WHERE id IN (SELECT id FROM customers_to_delete);

-- Paso 8: Limpiar números de teléfono vacíos o nulos
UPDATE public.customers 
SET phone = TRIM(phone)
WHERE phone IS NOT NULL AND TRIM(phone) != '';

UPDATE public.customers 
SET whatsapp_number = TRIM(whatsapp_number)
WHERE whatsapp_number IS NOT NULL AND TRIM(whatsapp_number) != '';

-- Paso 9: Establecer como NULL los números vacíos
UPDATE public.customers 
SET phone = NULL
WHERE phone = '' OR phone = ' ';

UPDATE public.customers 
SET whatsapp_number = NULL
WHERE whatsapp_number = '' OR whatsapp_number = ' ';

-- Paso 10: Limpiar las tablas temporales
DROP TABLE IF EXISTS customers_to_keep;
DROP TABLE IF EXISTS customers_to_delete;
