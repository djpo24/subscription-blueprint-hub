
import { useEffect, useState } from 'react';
import { PackageLabel } from './package-labels/PackageLabel';
import { PackageLabelPreview } from './package-labels/PackageLabelPreview';
import { PackageLabelPrintStyles } from './package-labels/PackageLabelPrintStyles';
import { generateAllLabelsData, LabelData } from './package-labels/PackageLabelGenerator';

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

  useEffect(() => {
    const generateLabelsData = async () => {
      const newLabelsData = await generateAllLabelsData(packages);
      setLabelsData(newLabelsData);
    };

    generateLabelsData();
  }, [packages]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <PackageLabelPreview 
        packages={packages}
        labelsData={labelsData}
        onPrint={handlePrint}
      />

      {/* Etiquetas para impresión */}
      <div className="print-only">
        {packages.map((pkg) => {
          const labelData = labelsData.get(pkg.id);
          return (
            <PackageLabel 
              key={pkg.id}
              package={pkg} 
              labelData={labelData} 
            />
          );
        })}
      </div>

      {/* CSS para impresión */}
      <PackageLabelPrintStyles />
    </div>
  );
}
