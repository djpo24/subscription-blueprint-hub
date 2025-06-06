
import { usePackageCodes } from '@/hooks/usePackageCodes';
import { PackageLabelPreviewCard } from './package-labels/PackageLabelPreviewCard';
import { PackageLabelPrint } from './package-labels/PackageLabelPrint';

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

  console.log('🏷️ PackageLabel component rendering for package:', pkg.id);
  console.log('📱 QR Code URL status:', qrCodeDataUrl ? 'Generated' : 'Pending');
  console.log('📊 Barcode URL status:', barcodeDataUrl ? 'Generated' : 'Pending');
  
  // Forzar recarga de datos para asegurar el uso del formato actualizado
  console.log('⚠️ Forzando uso del formato actualizado para etiqueta');

  const handlePrint = () => {
    console.log('🖨️ Printing single label with updated format for package:', pkg.id);
    window.print();
  };

  return (
    <div className="package-label-container">
      {/* Canvas oculto para generar el código de barras */}
      <canvas ref={barcodeCanvasRef} style={{ display: 'none' }} />
      
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-2">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Dimensiones: 10cm x 15cm (aproximadamente) - Formato actualizado
        </div>
        
        {/* Vista previa escalada de la etiqueta */}
        <PackageLabelPreviewCard 
          package={pkg}
          qrCodeDataUrl={qrCodeDataUrl}
          barcodeDataUrl={barcodeDataUrl}
        />

        <button
          onClick={handlePrint}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir Etiqueta (Formato Actualizado)
        </button>
      </div>

      {/* Etiqueta real para impresión */}
      <div className="print-only">
        <PackageLabelPrint 
          package={pkg}
          qrCodeDataUrl={qrCodeDataUrl}
          barcodeDataUrl={barcodeDataUrl}
        />
      </div>

      {/* CSS para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: 10cm 15cm;
            margin: 0;
          }
        }
        .package-label-container {
          max-width: 400px;
        }
        .label-preview {
          font-size: 8px;
        }
      `}</style>
    </div>
  );
}
