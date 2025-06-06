
import { useEffect, useState } from 'react';
import { NewPackageLabel } from './package-labels/NewPackageLabel';
import { generateAllLabelsData, LabelData } from './package-labels/PackageLabelGenerator';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

interface MultiplePackageLabelsProps {
  packages: Package[];
}

export function MultiplePackageLabels({ packages }: MultiplePackageLabelsProps) {
  const [labelsData, setLabelsData] = useState<Map<string, LabelData>>(new Map());
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(true);

  console.log('🏷️ MultiplePackageLabels - Packages received:', packages.length);

  useEffect(() => {
    const generateLabelsData = async () => {
      console.log('🔄 Generating labels data for', packages.length, 'packages with new format');
      setIsGeneratingCodes(true);
      
      try {
        const newLabelsData = await generateAllLabelsData(packages);
        console.log('✅ Generated labels data:', newLabelsData.size, 'labels');
        setLabelsData(newLabelsData);
      } catch (error) {
        console.error('❌ Error generating labels data:', error);
      } finally {
        setIsGeneratingCodes(false);
      }
    };

    if (packages.length > 0) {
      generateLabelsData();
    }
  }, [packages]);

  const handlePrint = () => {
    console.log('🖨️ Printing', packages.length, 'labels with new format');
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
          Vista Previa - {packages.length} Etiquetas (Nuevo Formato)
        </h3>
        <div className="text-sm text-gray-600 mb-4">
          Formato actualizado que coincide exactamente con la imagen de ejemplo
        </div>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {packages.map((pkg, index) => {
            const labelData = labelsData.get(pkg.id);
            return (
              <div key={pkg.id} className="border border-gray-300 bg-white p-4">
                <div className="text-xs text-gray-500 mb-2">
                  Etiqueta {index + 1} de {packages.length} - {pkg.tracking_number}
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
          Imprimir {packages.length} Etiqueta{packages.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Etiquetas para impresión */}
      <div className="print-only">
        {packages.map((pkg) => {
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
