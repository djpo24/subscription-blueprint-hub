
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
  const [isGeneratingCodes, setIsGeneratingCodes] = useState(true);

  console.log('🏷️ MultiplePackageLabels - Packages received:', packages.length);
  console.log('🏷️ MultiplePackageLabels - Package IDs:', packages.map(p => p.id));

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

  const handlePrint = () => {
    console.log('🖨️ Starting print process for', packages.length, 'labels');
    console.log('🔍 Labels data available:', labelsData.size);
    
    // Asegurarse de que los códigos estén generados antes de imprimir
    if (isGeneratingCodes) {
      console.log('⏳ Still generating codes, waiting...');
      return;
    }

    // Mostrar el contenedor de impresión temporalmente
    const printContainer = document.querySelector('.print-container') as HTMLElement;
    if (printContainer) {
      console.log('📄 Showing print container with', packages.length, 'labels');
      printContainer.style.display = 'block';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.zIndex = '9999';
      printContainer.style.width = '100vw';
      printContainer.style.height = '100vh';
      
      // Verificar que todas las etiquetas están presentes
      const labelPages = printContainer.querySelectorAll('.label-page');
      console.log('📋 Label pages found in print container:', labelPages.length);
      
      // Dar tiempo para que el DOM se actualice y luego imprimir
      setTimeout(() => {
        console.log('🖨️ Executing window.print()');
        window.print();
        
        // Ocultar el contenedor después de imprimir
        setTimeout(() => {
          if (printContainer) {
            printContainer.style.display = 'none';
            console.log('✅ Print container hidden');
          }
        }, 1000);
      }, 500);
    } else {
      console.error('❌ Print container not found');
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

  console.log('🎨 Rendering MultiplePackageLabels with', packages.length, 'packages');

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <PackageLabelPreview 
        packages={packages}
        labelsData={labelsData}
        onPrint={handlePrint}
      />

      {/* Contenedor de impresión - cada etiqueta en su propia página */}
      <div className="print-container" style={{ 
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'white'
      }}>
        {packages.map((pkg, index) => {
          const labelData = labelsData.get(pkg.id);
          console.log(`📄 Rendering page ${index + 1}/${packages.length} for package ${pkg.id}`, { 
            hasLabelData: !!labelData,
            trackingNumber: pkg.tracking_number 
          });
          
          return (
            <div key={`${pkg.id}-${index}`} className="label-page">
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
