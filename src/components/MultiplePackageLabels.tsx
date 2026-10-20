
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PackageLabel } from './package-labels/PackageLabel';
import { PackageLabelPreview } from './package-labels/PackageLabelPreview';
import { PackageLabelPrintStyles } from './package-labels/PackageLabelPrintStyles';
import { generateAllLabelsData, LabelData } from './package-labels/PackageLabelGenerator';
import { useMultipleLabelsPDF } from '@/hooks/useMultipleLabelsPDF';

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
  isReprint?: boolean;
}

export function MultiplePackageLabels({ packages, isReprint = false }: MultiplePackageLabelsProps) {
  const [labelsData, setLabelsData] = useState<Map<string, LabelData>>(new Map());
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(true);
  const [isPrintingPDF, setIsPrintingPDF] = useState(false);
  
  const { printMultipleLabelsAsPDF } = useMultipleLabelsPDF();

  console.log('🏷️ MultiplePackageLabels - Packages received:', packages.length);
  console.log('🏷️ MultiplePackageLabels - Package IDs:', packages.map(p => p.id));
  console.log('🔄 MultiplePackageLabels - Is reprint:', isReprint);

  useEffect(() => {
    const generateLabelsData = async () => {
      console.log('🔄 Generating labels data for', packages.length, 'packages');
      setIsGeneratingCodes(true);
      
      try {
        const newLabelsData = await generateAllLabelsData(packages);
        console.log('✅ Generated labels data:', newLabelsData.size, 'labels');
        console.log('🗂️ Labels data keys:', Array.from(newLabelsData.keys()));
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

  const handlePrintPDF = async () => {
    console.log('🖨️ [MultiplePackageLabels] Starting PDF print process for', packages.length, 'labels');
    console.log('🔄 [MultiplePackageLabels] Is reprint:', isReprint);
    
    if (isGeneratingCodes) {
      console.log('⏳ Still generating codes, waiting...');
      return;
    }

    if (isPrintingPDF) {
      console.log('⏳ PDF generation in progress...');
      return;
    }

    const missingLabels = packages.filter(pkg => !labelsData.has(pkg.id));
    if (missingLabels.length > 0) {
      console.error('❌ Missing label data for packages:', missingLabels.map(p => p.id));
      return;
    }

    try {
      setIsPrintingPDF(true);
      await printMultipleLabelsAsPDF(packages, labelsData, isReprint);
      console.log('✅ [MultiplePackageLabels] PDF print process completed');
    } catch (error) {
      console.error('❌ [MultiplePackageLabels] Error printing PDF:', error);
      toast.error(error instanceof Error ? error.message : 'No se pudo imprimir la etiqueta');
    } finally {
      setIsPrintingPDF(false);
    }
  };

  if (isGeneratingCodes) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Generando códigos QR y de barras...</p>
        </div>
      </div>
    );
  }

  if (isPrintingPDF) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Generando PDF con {packages.length} etiquetas...</p>
          <p className="text-sm text-gray-600 mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  console.log('🎨 Rendering MultiplePackageLabels with', packages.length, 'packages');

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <PackageLabelPreview 
        packages={packages}
        labelsData={labelsData}
        onPrint={handlePrintPDF}
        isPDFMode={true}
      />

      <PackageLabelPrintStyles />
    </div>
  );
}
