
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
      console.log('Generating labels data for', packages.length, 'packages');
      const newLabelsData = await generateAllLabelsData(packages);
      console.log('Generated labels data:', newLabelsData.size, 'labels');
      setLabelsData(newLabelsData);
    };

    generateLabelsData();
  }, [packages]);

  const handlePrint = () => {
    console.log('Starting print process for', packages.length, 'labels');
    // Dar tiempo para que el DOM se actualice antes de imprimir
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <PackageLabelPreview 
        packages={packages}
        labelsData={labelsData}
        onPrint={handlePrint}
      />

      {/* Contenedor de impresión con estructura optimizada */}
      <div className="print-container" style={{ display: 'none' }}>
        {packages.map((pkg, index) => {
          const labelData = labelsData.get(pkg.id);
          console.log(`Rendering label ${index + 1} for package ${pkg.id}`);
          return (
            <div key={pkg.id} className="label-page">
              <div className="label-content">
                <PackageLabel 
                  package={pkg} 
                  labelData={labelData}
                  isPrintMode={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS para impresión */}
      <PackageLabelPrintStyles />
    </div>
  );
}
