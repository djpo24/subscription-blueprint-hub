
import { useEffect, useState } from 'react';
import { PackageLabel } from './package-labels/PackageLabel';
import { PackageLabelPreview } from './package-labels/PackageLabelPreview';
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
  const [isPrinting, setIsPrinting] = useState(false);

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

  const createLabelHTML = (pkg: Package, labelData: LabelData | undefined) => {
    const labelHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Etiqueta ${pkg.tracking_number}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            body {
              font-family: Arial, sans-serif;
              background: white;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 40px;
            }
            
            @page {
              size: letter;
              margin: 0.5in;
            }
            
            .label {
              width: 6in;
              background: white;
              color: black;
              font-size: 14px;
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              border: 2px solid #000;
              margin: 0;
              padding: 0;
            }
            
            .header {
              background: white;
              padding: 8px;
              border-bottom: 2px solid #000;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              min-height: 60px;
            }
            
            .service {
              background: white;
              padding: 8px;
              border-bottom: 2px solid #000;
              text-align: center;
            }
            
            .content {
              background: white;
              padding: 12px;
              border-bottom: 2px solid #000;
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            
            .barcode {
              background: white;
              padding: 8px;
              border-bottom: 2px solid #000;
              text-align: center;
              min-height: 80px;
              display: flex;
              flex-direction: column;
              justify-content: center;
            }
            
            .qr {
              background: white;
              padding: 8px;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 90px;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="header">
              <div>
                <div style="font-size: 24px; font-weight: bold; line-height: 1;">E</div>
                <div style="font-size: 12px; font-weight: bold;">ENCOMIENDA</div>
                <div style="font-size: 10px;">ZONA: ${pkg.origin.substring(0, 1)}</div>
              </div>
              <div style="text-align: right; font-size: 10px;">
                <div>#${pkg.tracking_number.substring(0, 12)}</div>
                <div>${new Date(pkg.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
                <div>DE: ${pkg.origin.substring(0, 6)}</div>
              </div>
            </div>
            
            <div class="service">
              <div style="font-size: 14px; font-weight: bold;">ENCOMIENDA EXPRESS</div>
            </div>
            
            <div class="content">
              <div style="margin-bottom: 8px;">
                <div style="font-size: 10px; font-weight: bold;">DESDE:</div>
                <div style="font-size: 11px; word-wrap: break-word;">${pkg.origin}</div>
              </div>
              
              <div style="margin-bottom: 8px;">
                <div style="font-size: 10px; font-weight: bold;">PARA:</div>
                <div style="font-size: 13px; font-weight: bold; word-wrap: break-word;">${pkg.customers?.name || 'CLIENTE'}</div>
                <div style="font-size: 11px; word-wrap: break-word;">${pkg.destination}</div>
              </div>
              
              <div style="margin-bottom: 8px;">
                <div style="font-size: 10px; font-weight: bold;">DESCRIPCIÓN:</div>
                <div style="font-size: 10px; word-wrap: break-word; max-height: 50px; overflow: hidden;">${pkg.description}</div>
              </div>
              
              ${pkg.weight ? `<div style="font-size: 10px;"><span style="font-weight: bold;">PESO:</span> ${pkg.weight} kg</div>` : ''}
            </div>
            
            <div class="barcode">
              <div style="font-size: 10px; font-weight: bold; margin-bottom: 2px;">TRACKING #</div>
              ${labelData?.barcodeDataUrl ? `<img src="${labelData.barcodeDataUrl}" alt="Barcode" style="width: 90%; height: 60px; object-fit: contain; margin: 0 auto;">` : ''}
            </div>
            
            <div class="qr">
              ${labelData?.qrCodeDataUrl ? `
                <div style="text-align: center;">
                  <img src="${labelData.qrCodeDataUrl}" alt="QR Code" style="width: 60px; height: 60px; margin-bottom: 2px;">
                  <div style="font-size: 8px;">Gestión digital</div>
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    return labelHtml;
  };

  const handlePrint = async () => {
    console.log('🖨️ Starting RADICAL print process for', packages.length, 'labels');
    
    if (isGeneratingCodes) {
      console.log('⏳ Still generating codes, waiting...');
      return;
    }

    const missingLabels = packages.filter(pkg => !labelsData.has(pkg.id));
    if (missingLabels.length > 0) {
      console.error('❌ Missing label data for packages:', missingLabels.map(p => p.id));
      return;
    }

    setIsPrinting(true);

    try {
      console.log('🎯 Using RADICAL approach: Creating individual iframes for each label');
      
      // Crear un contenedor para todos los iframes
      const iframeContainer = document.createElement('div');
      iframeContainer.style.position = 'fixed';
      iframeContainer.style.top = '-9999px';
      iframeContainer.style.left = '-9999px';
      iframeContainer.style.width = '1px';
      iframeContainer.style.height = '1px';
      iframeContainer.style.overflow = 'hidden';
      document.body.appendChild(iframeContainer);

      const iframes: HTMLIFrameElement[] = [];

      // Crear un iframe por cada etiqueta
      for (let i = 0; i < packages.length; i++) {
        const pkg = packages[i];
        const labelData = labelsData.get(pkg.id);
        
        console.log(`📄 Creating iframe ${i + 1}/${packages.length} for package ${pkg.id}`);
        
        const iframe = document.createElement('iframe');
        iframe.style.width = '8.5in';
        iframe.style.height = '11in';
        iframe.style.border = 'none';
        iframe.style.position = 'absolute';
        iframe.style.top = '0';
        iframe.style.left = '0';
        
        iframeContainer.appendChild(iframe);
        iframes.push(iframe);

        // Escribir el HTML de la etiqueta en el iframe
        const labelHTML = createLabelHTML(pkg, labelData);
        
        iframe.onload = () => {
          if (iframe.contentDocument) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(labelHTML);
            iframe.contentDocument.close();
          }
        };
      }

      // Esperar a que todos los iframes se carguen
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('📊 All iframes created and loaded. Starting sequential printing...');

      // Función para imprimir iframe por iframe secuencialmente
      const printSequentially = async (index: number) => {
        if (index >= iframes.length) {
          console.log('✅ All labels printed successfully');
          // Limpiar iframes
          document.body.removeChild(iframeContainer);
          setIsPrinting(false);
          return;
        }

        const iframe = iframes[index];
        const pkg = packages[index];
        
        console.log(`🖨️ Printing label ${index + 1}/${packages.length} for package ${pkg.tracking_number}`);
        
        // Hacer visible solo el iframe actual
        iframe.style.position = 'fixed';
        iframe.style.top = '0';
        iframe.style.left = '0';
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.zIndex = '9999';
        iframe.style.background = 'white';

        // Imprimir el iframe actual
        if (iframe.contentWindow) {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        }

        // Continuar con el siguiente después de un delay
        setTimeout(() => {
          // Ocultar el iframe actual
          iframe.style.position = 'absolute';
          iframe.style.top = '-9999px';
          iframe.style.left = '-9999px';
          iframe.style.width = '1px';
          iframe.style.height = '1px';
          
          // Imprimir el siguiente
          printSequentially(index + 1);
        }, 1000);
      };

      // Iniciar la impresión secuencial
      printSequentially(0);

    } catch (error) {
      console.error('❌ Error in radical print process:', error);
      setIsPrinting(false);
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

  if (isPrinting) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Imprimiendo etiquetas... Por favor espere.</p>
          <p className="text-sm text-gray-600 mt-2">Cada etiqueta se imprimirá en una página separada</p>
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

      {/* Vista previa individual de cada etiqueta */}
      <div className="screen-only mt-4 space-y-4">
        {packages.map((pkg, index) => {
          const labelData = labelsData.get(pkg.id);
          return (
            <div key={pkg.id} className="border border-gray-300 bg-white p-4">
              <div className="text-xs text-gray-500 mb-2">
                Etiqueta {index + 1} de {packages.length} - {pkg.tracking_number}
              </div>
              <div className="flex justify-center bg-gray-50 p-4">
                <div style={{ transform: 'scale(0.4)', transformOrigin: 'top center' }}>
                  <PackageLabel package={pkg} labelData={labelData} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
