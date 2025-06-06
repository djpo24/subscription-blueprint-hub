
import { usePackageCodes } from '@/hooks/usePackageCodes';
import { NewPackageLabel } from './package-labels/NewPackageLabel';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  trip_id?: string;
  customers?: {
    name: string;
    email: string;
  };
  trip?: {
    trip_date: string;
  };
}

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
  const { barcodeCanvasRef, qrCodeDataUrl, barcodeDataUrl } = usePackageCodes(pkg);
  const [packageWithTripData, setPackageWithTripData] = useState<Package>(pkg);
  const [isLoadingTripData, setIsLoadingTripData] = useState(false);

  useEffect(() => {
    // Obtener datos del viaje para el paquete
    const fetchTripData = async () => {
      if (!pkg.trip_id) {
        console.log('⚠️ El paquete no tiene un viaje asociado, usando fecha de creación');
        return;
      }
      
      setIsLoadingTripData(true);
      console.log('🚢 Obteniendo datos del viaje para etiqueta. Trip ID:', pkg.trip_id);
      
      try {
        const { data: tripData, error } = await supabase
          .from('trips')
          .select('trip_date, origin, destination')
          .eq('id', pkg.trip_id)
          .single();
        
        if (error) {
          throw error;
        }
        
        if (tripData) {
          console.log('🚢 Encontrado datos del viaje para etiqueta:', tripData);
          console.log('📅 Fecha del viaje RAW de la BD:', tripData.trip_date);
          console.log('🛠️ Tipo de dato trip_date:', typeof tripData.trip_date);
          
          // Importante: asegurarnos de que trip_date sea string
          const tripDateString = String(tripData.trip_date);
          console.log('📅 Fecha del viaje convertida a string:', tripDateString);
          
          setPackageWithTripData(prevState => ({
            ...prevState,
            trip: { trip_date: tripDateString }
          }));
        }
      } catch (error) {
        console.error('⚠️ Error al obtener datos del viaje:', error);
      } finally {
        setIsLoadingTripData(false);
      }
    };

    fetchTripData();
  }, [pkg.trip_id]);

  console.log('🏷️ PackageLabel rendering for package:', pkg.id);
  console.log('📱 QR Code status:', qrCodeDataUrl ? 'Generated' : 'Pending');
  console.log('📅 Trip date:', packageWithTripData.trip?.trip_date || 'No disponible');

  const handlePrint = () => {
    console.log('🖨️ Printing single label for package:', pkg.id);
    window.print();
  };

  return (
    <div className="package-label-container">
      {/* Canvas oculto para generar el código de barras */}
      <canvas ref={barcodeCanvasRef} style={{ display: 'none' }} />
      
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-4 border rounded-lg bg-white screen-only">
        <h3 className="text-lg font-semibold mb-2">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Nuevo formato que coincide exactamente con la imagen de ejemplo
        </div>
        
        {isLoadingTripData ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Cargando datos del viaje...</span>
          </div>
        ) : (
          <div className="flex justify-center bg-gray-50 p-4">
            <NewPackageLabel 
              package={packageWithTripData}
              qrCodeDataUrl={qrCodeDataUrl}
              barcodeDataUrl={barcodeDataUrl}
              isPreview={true}
            />
          </div>
        )}

        <button
          onClick={handlePrint}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir Etiqueta
        </button>
      </div>

      {/* Etiqueta real para impresión */}
      <div className="print-only">
        <NewPackageLabel 
          package={packageWithTripData}
          qrCodeDataUrl={qrCodeDataUrl}
          barcodeDataUrl={barcodeDataUrl}
          isPreview={false}
        />
      </div>

      {/* Estilos para impresión */}
      <style>{`
        @media screen {
          .print-only { display: none; }
          .screen-only { display: block; }
        }
        
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .screen-only { display: none !important; }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
          }
          @page {
            size: 10cm 15cm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
