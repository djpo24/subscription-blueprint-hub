
import { useEffect, useState } from 'react';
import { PackageLabelPreview } from './package-labels/PackageLabelPreview';
import { MultiplePackageLabels } from './MultiplePackageLabels';
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
  const [showPreview, setShowPreview] = useState(true);

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
    setShowPreview(false);
  };

  const handleBackToPreview = () => {
    setShowPreview(true);
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

  const labelsData = new Map<string, LabelData>();
  labelsData.set(pkg.id, labelData);

  return (
    <div className="package-label-container">
      {showPreview ? (
        <PackageLabelPreview
          packages={[pkg]}
          labelsData={labelsData}
          onPrint={handlePrint}
          isPDFMode={false}
        />
      ) : (
        <div>
          <button
            onClick={handleBackToPreview}
            className="mb-4 text-blue-600 hover:text-blue-800 underline"
          >
            ← Volver a la vista previa
          </button>
          <MultiplePackageLabels packages={[pkg]} />
        </div>
      )}
    </div>
  );
}
