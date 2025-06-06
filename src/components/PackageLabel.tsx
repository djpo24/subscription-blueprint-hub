
import { usePackageCodes } from '@/hooks/usePackageCodes';
import { PackageLabelPreviewCard } from './package-labels/PackageLabelPreviewCard';
import { PackageLabelPrint } from './package-labels/PackageLabelPrint';
import { PackageLabelPrintStyles } from './package-labels/PackageLabelPrintStyles';

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
  console.log('📊 Barcode status:', barcodeDataUrl ? 'Generated' : 'Pending');

  const handlePrint = () => {
    console.log('🖨️ Printing single label for package:', pkg.id);
    console.log('📐 Print size: 10cm x 15cm');
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
          Dimensiones: 10cm x 15cm - Formato actualizado
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
          Imprimir Etiqueta (10cm × 15cm)
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

      {/* Estilos para impresión */}
      <PackageLabelPrintStyles />
    </div>
  );
}
