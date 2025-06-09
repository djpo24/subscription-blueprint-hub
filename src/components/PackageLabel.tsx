
import { useEffect, useState } from 'react';
import { PackageLabelPreview } from './package-labels/PackageLabelPreview';
import { generateLabelData, LabelData } from './package-labels/PackageLabelGenerator';
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
  const [isPrinting, setIsPrinting] = useState(false);
  
  const { printMultipleLabelsAsPDF } = useMultipleLabelsPDF();

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

  const handlePrint = async () => {
    if (!labelData || isPrinting) return;
    
    try {
      setIsPrinting(true);
      const labelsData = new Map<string, LabelData>();
      labelsData.set(pkg.id, labelData);
      await printMultipleLabelsAsPDF([pkg], labelsData);
    } catch (error) {
      console.error('Error printing label:', error);
    } finally {
      setIsPrinting(false);
    }
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

  if (!labelData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600">Error al generar los códigos</p>
        </div>
      </div>
    );
  }

  if (isPrinting) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Generando PDF e imprimiendo...</p>
        </div>
      </div>
    );
  }

  const labelsData = new Map<string, LabelData>();
  labelsData.set(pkg.id, labelData);

  return (
    <div className="package-label-container">
      <PackageLabelPreview
        packages={[pkg]}
        labelsData={labelsData}
        onPrint={handlePrint}
        isPDFMode={true}
      />
    </div>
  );
}
