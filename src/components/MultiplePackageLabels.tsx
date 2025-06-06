
import { useEffect, useState } from 'react';
import { NewPackageLabel } from './package-labels/NewPackageLabel';
import { generateAllLabelsData, LabelData } from './package-labels/PackageLabelGenerator';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
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

interface MultiplePackageLabelsProps {
  packages: Package[];
}

export function MultiplePackageLabels({ packages }: MultiplePackageLabelsProps) {
  const [labelsData, setLabelsData] = useState<Map<string, LabelData>>(new Map());
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(true);
  const [packagesWithTripData, setPackagesWithTripData] = useState<Package[]>([]);

  console.log('🏷️ MultiplePackageLabels - Packages received:', packages.length);

  useEffect(() => {
    // Cargar los datos de los viajes para los paquetes
    const fetchTripsData = async () => {
      if (packages.length === 0) return;
      
      // Obtener los trip_ids únicos
      const tripIds = [...new Set(packages.filter(pkg => pkg.trip_id).map(pkg => pkg.trip_id))];
      
      if (tripIds.length === 0) {
        console.log('⚠️ Ningún paquete tiene un viaje asociado');
        setPackagesWithTripData(packages);
        return;
      }
      
      // Obtener los datos de los viajes
      const { data: tripsData, error } = await supabase
        .from('trips')
        .select('id, trip_date')
        .in('id', tripIds);
      
      if (error) {
        console.error('❌ Error al obtener datos de viajes:', error);
        setPackagesWithTripData(packages);
        return;
      }
      
      // Mapear los datos de los viajes a los paquetes
      const enhancedPackages = packages.map(pkg => {
        if (!pkg.trip_id) return pkg;
        
        const tripData = tripsData?.find(trip => trip.id === pkg.trip_id);
        if (tripData) {
          console.log(`📅 Encontrado fecha de viaje para paquete ${pkg.id}: ${tripData.trip_date}`);
          return {
            ...pkg,
            trip: { trip_date: tripData.trip_date }
          };
        }
        return pkg;
      });
      
      console.log('✅ Datos de viajes cargados para', enhancedPackages.length, 'paquetes');
      setPackagesWithTripData(enhancedPackages);
    };

    fetchTripsData();
  }, [packages]);

  useEffect(() => {
    const generateLabelsData = async () => {
      if (packagesWithTripData.length === 0) return;
      
      console.log('🔄 Generando labels data para', packagesWithTripData.length, 'paquetes con nuevo formato');
      setIsGeneratingCodes(true);
      
      try {
        const newLabelsData = await generateAllLabelsData(packagesWithTripData);
        console.log('✅ Generated labels data:', newLabelsData.size, 'labels');
        setLabelsData(newLabelsData);
      } catch (error) {
        console.error('❌ Error generating labels data:', error);
      } finally {
        setIsGeneratingCodes(false);
      }
    };

    if (packagesWithTripData.length > 0) {
      generateLabelsData();
    }
  }, [packagesWithTripData]);

  const handlePrint = () => {
    console.log('🖨️ Printing', packagesWithTripData.length, 'labels with new format');
    window.print();
  };

  if (isGeneratingCodes) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generando códigos QR con nuevo formato...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <div className="screen-only mb-4 p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Printer className="h-5 w-5" />
          Vista Previa - {packagesWithTripData.length} Etiquetas (Nuevo Formato)
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          Formato actualizado que coincide exactamente con la imagen de ejemplo
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {packagesWithTripData.map((pkg, index) => {
            const labelData = labelsData.get(pkg.id);
            return (
              <div key={pkg.id} className="border border-gray-300 bg-white p-4">
                <div className="text-xs text-gray-500 mb-2">
                  Etiqueta {index + 1} de {packagesWithTripData.length} - {pkg.tracking_number}
                  {pkg.trip?.trip_date && <span className="ml-2">- Fecha de viaje: {new Date(pkg.trip.trip_date).toLocaleDateString()}</span>}
                </div>
                <div className="flex justify-center bg-gray-50 p-4">
                  <NewPackageLabel 
                    package={pkg}
                    qrCodeDataUrl={labelData?.qrCodeDataUrl || ''}
                    barcodeDataUrl={labelData?.barcodeDataUrl || ''}
                    isPreview={true}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <Button
          onClick={handlePrint}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Printer className="h-4 w-4" />
          Imprimir {packagesWithTripData.length} Etiqueta{packagesWithTripData.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Etiquetas para impresión */}
      <div className="print-only">
        {packagesWithTripData.map((pkg) => {
          const labelData = labelsData.get(pkg.id);
          return (
            <div key={pkg.id} style={{ pageBreakAfter: 'always' }}>
              <NewPackageLabel 
                package={pkg}
                qrCodeDataUrl={labelData?.qrCodeDataUrl || ''}
                barcodeDataUrl={labelData?.barcodeDataUrl || ''}
                isPreview={false}
              />
            </div>
          );
        })}
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
