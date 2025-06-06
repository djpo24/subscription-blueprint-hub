
import { usePackageCodes } from '@/hooks/usePackageCodes';
import { NewPackageLabel } from './package-labels/NewPackageLabel';

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

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
  const { barcodeCanvasRef, qrCodeDataUrl, barcodeDataUrl } = usePackageCodes(pkg);

  console.log('🏷️ PackageLabel rendering for package:', pkg.id);
  console.log('📱 QR Code status:', qrCodeDataUrl ? 'Generated' : 'Pending');

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
        
        {/* Vista previa de la etiqueta */}
        <div className="flex justify-center bg-gray-50 p-4">
          <NewPackageLabel 
            package={pkg}
            qrCodeDataUrl={qrCodeDataUrl}
            barcodeDataUrl={barcodeDataUrl}
            isPreview={true}
          />
        </div>

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
          package={pkg}
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
