-- Limpiar todas las tablas relacionadas con bultos

-- Eliminar todas las etiquetas de paquetes (package_labels)
DELETE FROM package_labels;

-- Resetear bulto_id en packages
UPDATE packages SET bulto_id = NULL WHERE bulto_id IS NOT NULL;

-- Eliminar todos los bultos
DELETE FROM bultos;

-- Resetear label_count en packages a 1
UPDATE packages SET label_count = 1 WHERE label_count > 1;