
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';

interface BulkPackageCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const PACKAGES_TO_CREATE = [
  { codigo: 'EO-2025-4353', nombre: 'TATIANA MONTALVO', detalles: '2 SANUBRO', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-3760', nombre: 'ADELBERT CIJNTJO', detalles: '1 BILLETERA', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-9005', nombre: 'DOMINGO CURACAO', detalles: '2 CAMISETAS, 5 PRESTAS DE ORO', peso: 1, flete: 0, valorCobrar: 145, divisa: 'AWG' },
  { codigo: 'EO-2025-9301', nombre: 'GISELLE VILLALOBOS', detalles: '3 PELUCHES, 5 CARTERAS, 12 LLAVEROS', peso: 1.5, flete: 0, valorCobrar: 30, divisa: 'AWG' },
  { codigo: 'EO-2025-3665', nombre: 'DANIELA MOLINA', detalles: '2 WAFLERAS, 1 ALBUN DE DIOMEDEZ, 2 FRASCOS, 1 BOLSITA CON PALETAS, 1 PAQUETE DE BOLSAS, 1 PAQUETE DE CUCHARAS, 3 POTECITOS', peso: 4, flete: 0, valorCobrar: 80, divisa: 'AWG' },
  { codigo: 'EO-2025-2375', nombre: 'JUDITH PEÑA', detalles: '1 CAJA DE PALITOS, 1 TELA, 1 AGUJAS, 1 ELASTICO', peso: 1.5, flete: 0, valorCobrar: 30, divisa: 'AWG' },
  { codigo: 'EO-2025-9596', nombre: 'CARLOS AVILES', detalles: '1 BOLSA DE SUPER COCO , 2 FORROS DE CELULAR', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-4821', nombre: 'MERLYN ARIZA', detalles: '1 LIMPIADOR DE DIENTES, 1 CABLES, 1 FORRO', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-8713', nombre: 'MADELEIN ALGARIN', detalles: '1 PAR DE TOPITOS, 1 CORTACUTICULA, 3 PINCELES, 3 ESMALTE, 2 GUANTES, 4 ESPATULAS', peso: 1, flete: 0, valorCobrar: 40, divisa: 'AWG' },
  { codigo: 'EO-2025-0589', nombre: 'MIRTHA NAVARRO', detalles: '9 BISUTERIA, 4 SPLASH, 2 TEMPTATION, 2 TOTALIST, 4 MUESTRAS, 5 PIEZAS DE ROPA, 2 SENTIVE, 4 DULCES COLONIAS, 1 LOCION DE SEDA, 1 MASCARILLA ANTI ARRUGAS', peso: 4, flete: 0, valorCobrar: 80, divisa: 'AWG' },
  { codigo: 'EO-2025-9339', nombre: 'SILVIA IROUQUIN', detalles: '12 PIEZAS DE ROPA', peso: 5, flete: 0, valorCobrar: 100, divisa: 'AWG' },
  { codigo: 'EO-2025-0272', nombre: 'DANIELA HERNANDEZ', detalles: '1 PAQUETE CON ROPA', peso: 2, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-0601', nombre: 'MONICA HINCAPIE', detalles: '1 PAR DE BOTAS, 3 ACEITES AMBIENTALES, 2 REPUESTOS DE CARRO, 2 SOPORTES PARA MOTOR, 2 FILTROS, 1 SENSOR, 1 FRASCO', peso: 3, flete: 0, valorCobrar: 70, divisa: 'AWG' },
  { codigo: 'EO-2025-8482', nombre: 'CAROL ORTEGA', detalles: '1 FAJA', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-1495', nombre: 'KIMBERLY MADURO', detalles: '6 PIEZAS DE ROPA', peso: 1.2, flete: 0, valorCobrar: 25, divisa: 'AWG' },
  { codigo: 'EO-2025-4490', nombre: 'VIJAY KODWANI', detalles: '2 ROLLOS DE PUBLICIDAD', peso: 3, flete: 0, valorCobrar: 60, divisa: 'AWG' },
  { codigo: 'EO-2025-6821', nombre: 'FREDDY MEJIA', detalles: '1 BOLSA DE GLOBOS, 1 AFICHE, 1 PAR DE ZAPATOS REPLICAS, 1 CAMISETA', peso: 1, flete: 0, valorCobrar: 50, divisa: 'AWG' },
  { codigo: 'EO-2025-7994', nombre: 'MARIETH CASTAÑEDA', detalles: '1 PIEZA DE ROPA', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-0359', nombre: 'EDITH CABARCAS', detalles: '2 PERFUMES, 1 CAFE, 7 PIEZAS DE ROPA', peso: 3.2, flete: 0, valorCobrar: 65, divisa: 'AWG' },
  { codigo: 'EO-2025-0608', nombre: 'JOSE GOMEZ', detalles: '1 PELUCA, 1 PAR DE ZAPATOS REPLICA, 1 CONJUNTO', peso: 1, flete: 0, valorCobrar: 50, divisa: 'AWG' },
  { codigo: 'EO-2025-8596', nombre: 'LUZ MARINA VIVEROS', detalles: '4 BOLSOS, 3 PARES DE ZAPATOS REPLICAS', peso: 2, flete: 0, valorCobrar: 130, divisa: 'AWG' },
  { codigo: 'EO-2025-6765', nombre: 'DEIMYS MEDINA', detalles: '1 FORRO PARA LIBRO, 1 METACARBOMOL, 1 AIRFLEX, 2 NODOL MAX', peso: 1, flete: 0, valorCobrar: 25, divisa: 'AWG' },
  { codigo: 'EO-2025-2221', nombre: 'ANTONY DE LA ASUNCION NAVARRO', detalles: '2 PIEZAS DE ROPA, 1 GORRA', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-4135', nombre: 'GENESIS LOPEZ', detalles: '6 PIEZAS DE ROPA, 1 BOLSITA CON BISUTERIA', peso: 1, flete: 0, valorCobrar: 30, divisa: 'AWG' },
  { codigo: 'EO-2025-3633', nombre: 'KAREN PEÑA', detalles: '1 TALONARIO DE PUBLICIDAD', peso: 2, flete: 0, valorCobrar: 40, divisa: 'AWG' },
  { codigo: 'EO-2025-8598', nombre: 'BUENAVENTURA OROZCO', detalles: '1 DOCUMENTO', peso: 0, flete: 0, valorCobrar: 25, divisa: 'AWG' },
  { codigo: 'EO-2025-7051', nombre: 'SUNEY CEPEDA', detalles: '2 PARES DE CHANCLAS REPLICAS, 1 BOLSO, 2 CONJUNTOS, 1 RELOJ, 1 RELOJ CON CADENA , 1 RELOJ CON CARTERA Y PULCERA', peso: 2.5, flete: 0, valorCobrar: 75, divisa: 'AWG' },
  { codigo: 'EO-2025-0809', nombre: 'KELLY FERREIRA', detalles: '2 PARES DE SANDALIAS, 1 VESTIDO, 1 DOCUMENTO', peso: 2, flete: 0, valorCobrar: 90, divisa: 'AWG' },
  { codigo: 'EO-2025-2407', nombre: 'ZADITH BOLAÑO', detalles: '8 PIEZAS DE ROPA, 3 BISUTERIA, 1 BOLSO, 4 PIEZAS DE ROPA', peso: 5, flete: 0, valorCobrar: 100, divisa: 'AWG' },
  { codigo: 'EO-2025-2583', nombre: 'NIDIS HERNANDEZ', detalles: '1 VESTIDO', peso: 1, flete: 16500, valorCobrar: 30, divisa: 'AWG' },
  { codigo: 'EO-2025-2331', nombre: 'ANGELA BASILIA', detalles: '35 CAMISETAS', peso: 7, flete: 0, valorCobrar: 140, divisa: 'AWG' },
  { codigo: 'EO-2025-2385', nombre: 'TATIANA GOMEZ', detalles: '6 PIEZAS DE ROPA, 5 BOLSOS TEJIDOS, 11 VESTIDOS, 25 BOLSOS TEJIDOS', peso: 16, flete: 0, valorCobrar: 320, divisa: 'AWG' },
  { codigo: 'EO-2025-1519', nombre: 'EMILIA SILETH', detalles: '3 ALKASERCE, 2 NOXPIRIN, 2 DOLOFEN, 2 CAJAS DE SHARY, 2 BYSPRO', peso: 3.2, flete: 0, valorCobrar: 65, divisa: 'AWG' },
  { codigo: 'EO-2025-5705', nombre: 'ZULEYMA POLO', detalles: '1 CAFETERA', peso: 4, flete: 0, valorCobrar: 80, divisa: 'AWG' },
  { codigo: 'EO-2025-3416', nombre: 'ELIANA OSMAN', detalles: '1 PAR DE ZAPATOS REPLICAS, 1 PAR DE CHANCLAS REPLICAS, 1 PAR DE TACONES, 1 BOLSO REPPLICA', peso: 1.5, flete: 0, valorCobrar: 60, divisa: 'AWG' },
  { codigo: 'EO-2025-3951', nombre: 'GUILLERMINA CARDENAS', detalles: '2 TELAS', peso: 2, flete: 0, valorCobrar: 40, divisa: 'AWG' },
  { codigo: 'EO-2025-0617', nombre: 'WENDY MEDINA', detalles: '3 PARES DE ZAPATOS REPLICAS', peso: 1, flete: 0, valorCobrar: 95, divisa: 'AWG' },
  { codigo: 'EO-2025-0222', nombre: 'GISELLE FRUTO', detalles: '11 PIEZAS DE ROPA', peso: 4, flete: 0, valorCobrar: 80, divisa: 'AWG' },
  { codigo: 'EO-2025-8309', nombre: 'RUBEN DARIO', detalles: '26 MONEDEROS, 24 IMANES, 1 ROLLO CON PINTURAS, 16 ADORNOS DE PARED PEQUEÑOS, 11 ADORNOS DE PARED GRANDE, 6 MOÑAS, 1 ROLLO CON PINTURA', peso: 5.2, flete: 0, valorCobrar: 105, divisa: 'AWG' },
  { codigo: 'EO-2025-6247', nombre: 'CHIKY DOMINICANA', detalles: '3 AURORA LILA, 2 SPRINT, 1 DORSAY, 1 MISS, 1 NITRO, 1 HYPNOTISAN, 2 SPLASH, 1 CREMA MISS, 1 MUESTRA , 2 MUESTRAS', peso: 3, flete: 0, valorCobrar: 60, divisa: 'AWG' },
  { codigo: 'EO-2025-0655', nombre: 'ALIX TRESPALACIO', detalles: '17 PIEZAS DE ROPA', peso: 4, flete: 0, valorCobrar: 80, divisa: 'AWG' },
  { codigo: 'EO-2025-2978', nombre: 'MARILYN PINTO', detalles: '1 BROWN, 1 PULUIC, 2 GALLETICAS', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-3278', nombre: 'CHEIRY CONRRADO', detalles: '1 REPUESTO DE CARRO', peso: 1, flete: 0, valorCobrar: 20, divisa: 'AWG' },
  { codigo: 'EO-2025-4589', nombre: 'YURLEYDIS DE LA CRUZ', detalles: '1 PALETA DE COLORES, 1 KIT DE BELLEZA, 1 AZUFRE, 1 ESPOJILLA, 1 LIQUIDO PARA MAQUILLAJE, 2 CREMAS CONTORNO DE OJOS, 1 CORRECTOR, 2 LIQUIDO PARA DESMAQUILLAR', peso: 1.3, flete: 8, valorCobrar: 25, divisa: 'AWG' },
  { codigo: 'EO-2025-0538', nombre: 'HENRY AVILA', detalles: '3 PARES DE ZAPATOS REPLICAS', peso: 1, flete: 0, valorCobrar: 90, divisa: 'AWG' },
  { codigo: 'EO-2025-6882', nombre: 'NATALIA MORENO', detalles: '4 PARES DE ZAPATOS REPLICAS, 25 PIEZAS DE ROPA , 18 PIEZAS DE ROPA', peso: 17.5, flete: 0, valorCobrar: 435, divisa: 'AWG' },
  { codigo: 'EO-2025-5079', nombre: 'DORIS ROJAS', detalles: '1 JARABE DE CONCRETO, 1 METROPOLOL, 3 LABIALES, 3 PANTALONESTAS, 3 CAMISAS, 1 PAR DE ZAPATOS , 2 BOLSAS DE BOLIS, 1 BOLSA DE HIELO', peso: 2, flete: 0, valorCobrar: 40, divisa: 'AWG' },
  { codigo: 'EO-2025-3852', nombre: 'CINDY AYALA', detalles: '3 PIEZAS DE ROPA, 1 PAR DE MEDIAS, 3 PIEZAS DE ROPA , 3 PIEZAS DE ROPA', peso: 2.2, flete: 0, valorCobrar: 45, divisa: 'AWG' },
  { codigo: 'EO-2025-3773', nombre: 'LADY HERRERA', detalles: '8 PIEZAS DE ROPA, 2 PARES DE TACONES, 4 PARES DE ZAPATOS DEPLICAS DE NIÑO, 2 PARES DE ZAPATOS NACIONALES, 2 TERMOS, 2 PIEZAS DE ROPA, 1 BOLSO', peso: 6.5, flete: 33.5, valorCobrar: 148, divisa: 'AWG' },
  { codigo: 'EO-2025-1907', nombre: 'DORALYZ CARDOZO', detalles: '8 PIEZAS DE ROPA INTIMAS, 1 PROTECTOR BUCAL', peso: 1.2, flete: 0, valorCobrar: 25, divisa: 'AWG' },
  { codigo: 'EO-2025-7004', nombre: 'MARIA ALEJANDRA DE LA CRUZ', detalles: '2 SUETERES, 4 PIEZAS DE ROPA INTERIOR, 1 REVISTA, 1 SILVER, 1 HOMER, 1 BARBE', peso: 2, flete: 0, valorCobrar: 40, divisa: 'AWG' },
  { codigo: 'EO-2025-5557', nombre: 'GABY LUGO', detalles: '1 PAR DE ZAPATOS REPLICA', peso: 0, flete: 0, valorCobrar: 30, divisa: 'AWG' },
  { codigo: 'EO-2025-6973', nombre: 'ANA MELENDEZ', detalles: '2 PARES DE ZAPATOS REPLICAS', peso: 1, flete: 0, valorCobrar: 60, divisa: 'AWG' },
  { codigo: 'EO-2025-7905', nombre: 'LICY CURACAO', detalles: '6 PAQUETES CON ROPA, 2 PAQUETES CON ROPA, 2 PAQUETES CON ROPA', peso: 19.5, flete: 220000, valorCobrar: 490, divisa: 'AWG' }
];

export function BulkPackageCreationDialog({ open, onOpenChange, onSuccess }: BulkPackageCreationDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createdPackages, setCreatedPackages] = useState<string[]>([]);
  const [failedPackages, setFailedPackages] = useState<string[]>([]);
  const [notFoundCustomers, setNotFoundCustomers] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const findCustomerByName = async (customerName: string) => {
    console.log(`🔍 Buscando cliente: ${customerName}`);
    
    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, name')
      .ilike('name', customerName);

    if (error) {
      console.error('Error buscando cliente:', error);
      throw error;
    }

    // Buscar coincidencia exacta
    const exactMatch = customers?.find(c => c.name.toUpperCase() === customerName.toUpperCase());
    if (exactMatch) {
      console.log(`✅ Cliente encontrado (coincidencia exacta): ${exactMatch.name} (ID: ${exactMatch.id})`);
      return exactMatch.id;
    }

    console.log(`❌ No se encontró cliente con nombre: ${customerName}`);
    return null;
  };

  const createSinglePackage = async (packageData: typeof PACKAGES_TO_CREATE[0]) => {
    console.log(`📦 Creando paquete: ${packageData.codigo} para ${packageData.nombre}`);

    // Buscar el customer_id
    const customerId = await findCustomerByName(packageData.nombre);
    if (!customerId) {
      throw new Error(`Cliente no encontrado: ${packageData.nombre}`);
    }

    // Obtener un viaje activo para asignar el paquete
    const { data: trips, error: tripError } = await supabase
      .from('trips')
      .select('id, origin, destination, flight_number')
      .eq('status', 'pending')
      .limit(1);

    if (tripError) throw tripError;

    if (!trips || trips.length === 0) {
      throw new Error('No hay viajes disponibles para asignar el paquete');
    }

    const trip = trips[0];

    const packageToInsert = {
      tracking_number: packageData.codigo,
      customer_id: customerId,
      description: packageData.detalles,
      weight: packageData.peso || null,
      freight: packageData.flete || 0,
      amount_to_collect: packageData.valorCobrar || 0,
      currency: packageData.divisa,
      origin: trip.origin || 'Colombia',
      destination: trip.destination || 'Curaçao',
      flight_number: trip.flight_number,
      trip_id: trip.id,
      status: 'recibido'
    };

    console.log('📤 Datos del paquete a insertar:', packageToInsert);

    const { data, error } = await supabase
      .from('packages')
      .insert([packageToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error insertando paquete:', error);
      throw error;
    }

    // Crear evento de tracking inicial
    if (data) {
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: data.id,
          event_type: 'created',
          description: 'Encomienda creada - Importación masiva',
          location: trip.origin || 'Colombia'
        }]);
    }

    return data;
  };

  const handleBulkCreation = async () => {
    setIsCreating(true);
    setCurrentIndex(0);
    setCreatedPackages([]);
    setFailedPackages([]);
    setNotFoundCustomers([]);

    for (let i = 0; i < PACKAGES_TO_CREATE.length; i++) {
      const packageData = PACKAGES_TO_CREATE[i];
      setCurrentIndex(i + 1);
      
      try {
        await createSinglePackage(packageData);
        setCreatedPackages(prev => [...prev, `${packageData.codigo} - ${packageData.nombre}`]);
        console.log(`✅ Paquete creado: ${packageData.codigo} para ${packageData.nombre}`);
        
        // Pequeña pausa para no sobrecargar el servidor
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error: any) {
        console.error(`❌ Error creando paquete ${packageData.codigo}:`, error);
        
        if (error.message.includes('Cliente no encontrado')) {
          setNotFoundCustomers(prev => [...prev, packageData.nombre]);
        } else {
          setFailedPackages(prev => [...prev, `${packageData.codigo} - ${packageData.nombre}`]);
        }
      }
    }

    setIsCreating(false);
    
    // Invalidar queries para refrescar las listas de paquetes
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    
    toast({
      title: "Importación masiva completada",
      description: `${createdPackages.length + 1} paquetes creados, ${failedPackages.length} fallaron, ${notFoundCustomers.length} clientes no encontrados`,
    });

    onSuccess();
  };

  const progress = PACKAGES_TO_CREATE.length > 0 ? (currentIndex / PACKAGES_TO_CREATE.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Importación Masiva de Encomiendas</DialogTitle>
          <DialogDescription>
            Se importarán {PACKAGES_TO_CREATE.length} encomiendas con sus códigos de tracking exactos 
            y se asignarán a los clientes correspondientes según coincidencia de nombres.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {isCreating && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creando encomiendas...</span>
                <span>{currentIndex} / {PACKAGES_TO_CREATE.length}</span>
              </div>
              <Progress value={progress} className="w-full" />
              {currentIndex > 0 && (
                <p className="text-sm text-muted-foreground">
                  Procesando: {PACKAGES_TO_CREATE[currentIndex - 1]?.codigo} - {PACKAGES_TO_CREATE[currentIndex - 1]?.nombre}
                </p>
              )}
            </div>
          )}

          {!isCreating && (createdPackages.length > 0 || failedPackages.length > 0 || notFoundCustomers.length > 0) && (
            <div className="space-y-3">
              <div className="text-sm font-medium">Resultados:</div>
              
              {createdPackages.length > 0 && (
                <div className="text-sm text-green-600">
                  ✅ Encomiendas creadas: {createdPackages.length}
                </div>
              )}
              
              {notFoundCustomers.length > 0 && (
                <div className="text-sm text-yellow-600">
                  ⚠️ Clientes no encontrados: {notFoundCustomers.length}
                  <div className="mt-1 text-xs max-h-20 overflow-y-auto">
                    {notFoundCustomers.join(', ')}
                  </div>
                </div>
              )}
              
              {failedPackages.length > 0 && (
                <div className="text-sm text-red-600">
                  ❌ Encomiendas fallidas: {failedPackages.length}
                  <div className="mt-1 text-xs max-h-20 overflow-y-auto">
                    {failedPackages.join(', ')}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border rounded p-3">
            <div className="text-sm font-medium mb-2">Vista previa de encomiendas a importar:</div>
            <div className="max-h-40 overflow-y-auto">
              <div className="text-xs space-y-1">
                {PACKAGES_TO_CREATE.slice(0, 10).map((pkg, index) => (
                  <div key={index} className="flex justify-between items-center p-1 border-b border-gray-100">
                    <span className="font-mono">{pkg.codigo}</span>
                    <span className="truncate max-w-[200px]">{pkg.nombre}</span>
                    <span className="text-muted-foreground">
                      {pkg.divisa} ${pkg.valorCobrar} | {pkg.peso}kg
                    </span>
                  </div>
                ))}
                {PACKAGES_TO_CREATE.length > 10 && (
                  <div className="text-center text-muted-foreground">
                    ... y {PACKAGES_TO_CREATE.length - 10} más
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
          >
            {isCreating ? 'Procesando...' : 'Cerrar'}
          </Button>
          {!isCreating && (
            <Button 
              type="button" 
              onClick={handleBulkCreation}
              disabled={isCreating}
            >
              Importar Todas las Encomiendas
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
