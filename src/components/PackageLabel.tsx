
import { useEffect, useState } from 'react';
import { PackageLabelPreviewCard } from './package-labels/PackageLabelPreviewCard';
import { PackageLabel as PackageLabelPrint } from './package-labels/PackageLabel';
import { generateLabelData, LabelData } from './package-labels/PackageLabelGenerator';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  amount_to_collect?: number | null;
  currency?: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
  const [labelData, setLabelData] = useState<LabelData | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const generateCodes = async () => {
      try {
        const data = await generateLabelData(pkg);
        setLabelData(data);
      } catch (error) {
        console.error('Error generating label data:', error);
      } finally {
        setIsGenerating(false);
      }
    };

    generateCodes();
  }, [pkg]);

  const handlePrint = () => {
    window.print();
  };

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generando códigos QR y de barras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="package-label-container">
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-4 border rounded-lg bg-white screen-only">
        <h3 className="text-lg font-semibold mb-2">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Formato unificado - Tamaño: 10.2cm x 15.2cm
        </div>
        
        {/* Vista previa escalada de la etiqueta */}
        <div className="flex justify-center bg-gray-50 p-4">
          <PackageLabelPreviewCard 
            package={pkg}
            labelData={labelData}
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
        <PackageLabelPrint 
          package={pkg}
          labelData={labelData}
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
          .screen-only {
            display: none !important;
          }
          @page {
            size: 10.2cm 15.2cm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}
