
-- Crear función que valida si una encomienda puede cambiar a "en transito"
CREATE OR REPLACE FUNCTION public.validate_package_transit_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el nuevo estado es "transito" o "in_transit"
  IF NEW.status IN ('transito', 'in_transit') THEN
    -- Verificar que la encomienda esté en un despacho
    IF NOT EXISTS (
      SELECT 1 
      FROM public.dispatch_packages dp
      JOIN public.dispatch_relations dr ON dp.dispatch_id = dr.id
      WHERE dp.package_id = NEW.id 
      AND dr.status = 'en_transito'
    ) THEN
      RAISE EXCEPTION 'Una encomienda solo puede cambiar a estado "en transito" si está en un despacho con estado "en_transito". Encomienda: %', NEW.tracking_number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que ejecuta la validación antes de actualizar
DROP TRIGGER IF EXISTS trigger_validate_package_transit ON public.packages;
CREATE TRIGGER trigger_validate_package_transit
  BEFORE UPDATE ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_package_transit_status();

-- También crear un trigger para inserts (por si acaso)
DROP TRIGGER IF EXISTS trigger_validate_package_transit_insert ON public.packages;
CREATE TRIGGER trigger_validate_package_transit_insert
  BEFORE INSERT ON public.packages
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_package_transit_status();
