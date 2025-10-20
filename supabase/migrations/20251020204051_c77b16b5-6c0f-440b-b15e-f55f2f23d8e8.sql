-- Revertir paquetes que fueron entregados incorrectamente
-- Estos paquetes fueron creados hoy pero no pasaron por el flujo normal de tránsito/llegada

UPDATE packages
SET 
  status = 'procesado',
  delivered_at = NULL,
  delivered_by = NULL,
  updated_at = NOW()
WHERE id IN (
  '86590030-5026-44c0-8d65-ebd50594b4ff', -- ISAIAS TOVAR - EO-2025-1220
  'bc001fa6-eed2-4c2f-b16e-eeffebf2a6b1', -- ALFREDO TOVAR - EO-2025-7938
  '652ade24-ae43-4574-9c86-52068f85212c', -- YASMIN B - EO-2025-4269
  '952136fe-4960-4ebd-be0e-52bd2eac7442', -- SIVELYZ BORJA - EO-2025-4593
  '27a21a63-95e0-4bd0-a153-a7856e372724', -- HERNAN GALINDO - EO-2025-5078
  '043b10d3-3c09-4e93-8915-0b6d5c3e38ce', -- DARLENYS C - EO-2025-5193
  '5ae15a3a-2155-4afe-a8d7-6369a48e990d', -- MERLYN MORENO - EO-2025-7483
  'a6f2aef2-f9ef-4603-9d98-8728d0886741', -- VANESSA ARDILA - EO-2025-7053
  'dac80c1e-0390-4851-8e7d-8cd38d01710e', -- YESSICA PARRA - EO-2025-8624
  '23578400-8470-4a4a-8eb7-d539815226bf'  -- ALICIA A - EO-2025-8388
);

-- Registrar la corrección en user_actions para auditoría
INSERT INTO user_actions (
  user_id,
  action_type,
  description,
  table_name,
  can_revert
) VALUES (
  auth.uid(),
  'bulk_update',
  'Reversión automática de 10 paquetes entregados incorrectamente sin pasar por flujo de tránsito',
  'packages',
  false
);

-- Agregar comentario en tracking_events para documentar la corrección
INSERT INTO tracking_events (package_id, event_type, description, location)
SELECT 
  id,
  'corrected',
  'Entrega revertida: paquete entregado sin pasar por flujo de tránsito. Estado corregido a procesado.',
  'Sistema'
FROM packages
WHERE id IN (
  '86590030-5026-44c0-8d65-ebd50594b4ff',
  'bc001fa6-eed2-4c2f-b16e-eeffebf2a6b1',
  '652ade24-ae43-4574-9c86-52068f85212c',
  '952136fe-4960-4ebd-be0e-52bd2eac7442',
  '27a21a63-95e0-4bd0-a153-a7856e372724',
  '043b10d3-3c09-4e93-8915-0b6d5c3e38ce',
  '5ae15a3a-2155-4afe-a8d7-6369a48e990d',
  'a6f2aef2-f9ef-4603-9d98-8728d0886741',
  'dac80c1e-0390-4851-8e7d-8cd38d01710e',
  '23578400-8470-4a4a-8eb7-d539815226bf'
);