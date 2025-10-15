-- Corrección de flete para encomienda EO-2025-2355
-- El valor fue guardado incorrectamente como 53.3 cuando debía ser 53300

UPDATE packages 
SET 
  freight = 53300,
  updated_at = NOW()
WHERE id = 'ad382cbc-b0fd-41bf-aa08-29c4ac2d4fea' 
  AND tracking_number = 'EO-2025-2355';