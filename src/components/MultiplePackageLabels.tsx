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
    
    if (isGeneratingCodes) {
      console.log('⏳ Still generating codes, waiting...');
      return;
    }

    const missingLabels = packages.filter(pkg => !labelsData.has(pkg.id));
    if (missingLabels.length > 0) {
      console.error('❌ Missing label data for packages:', missingLabels.map(p => p.id));
      return;
    }

    const printContainer = document.querySelector('.print-container') as HTMLElement;
    if (printContainer) {
      console.log('📄 Preparing print container with', packages.length, 'labels');
      
      // Configurar el contenedor para impresión
      printContainer.style.display = 'block';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.zIndex = '9999';
      printContainer.style.width = '100vw';
      printContainer.style.height = '100vh';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.overflow = 'visible';
      
      // Tiempo extra aumentado para que el DOM se estabilice completamente con múltiples páginas
      setTimeout(() => {
        const labelPages = printContainer.querySelectorAll('.label-page');
        console.log('📊 Final verification before print:');
        console.log('  - Expected pages:', packages.length);
        console.log('  - Found pages:', labelPages.length);
        console.log('  - All pages have content:', Array.from(labelPages).every(page => 
          page.querySelector('[data-package-id]') !== null
        ));
        
        // Verificar que cada página tiene la estructura correcta
        labelPages.forEach((page, index) => {
          const packageElement = page.querySelector('[data-package-id]');
          const packageId = packageElement?.getAttribute('data-package-id');
          console.log(`  📄 Page ${index + 1}: Package ID = ${packageId || 'MISSING'}`);
          
          // Forzar que cada página sea reconocida individualmente
          (page as HTMLElement).style.pageBreakAfter = 'always';
          (page as HTMLElement).style.breakAfter = 'page';
          (page as HTMLElement).style.height = '100vh';
          (page as HTMLElement).style.minHeight = '100vh';
        });
        
        console.log('🖨️ Executing window.print() with', labelPages.length, 'pages');
        
        // Dar un tiempo adicional para que los estilos se apliquen
        setTimeout(() => {
          window.print();
          
          setTimeout(() => {
            if (printContainer) {
              printContainer.style.display = 'none';
              console.log('✅ Print container hidden');
            }
          }, 1000);
        }, 500);
      }, 2000); // Tiempo aumentado para múltiples páginas
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

      {/* Contenedor de impresión optimizado */}
      <div className="print-container" style={{ 
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
        backgroundColor: 'white',
        overflow: 'visible'
      }}>
        {packages.map((pkg, index) => {
          const labelData = labelsData.get(pkg.id);
          console.log(`📄 Creating page ${index + 1}/${packages.length} for package ${pkg.id}`);
          
          return (
            <div key={`print-page-${pkg.id}`} className="label-page">
              <div className="label-content">
                <div data-package-id={pkg.id} data-page-number={index + 1}>
                  <PackageLabel 
                    package={pkg} 
                    labelData={labelData}
                    isPrintMode={true}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <PackageLabelPrintStyles />
    </div>
  );
}
