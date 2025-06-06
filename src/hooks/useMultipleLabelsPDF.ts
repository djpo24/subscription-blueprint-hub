
import { useCallback } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function useMultipleLabelsPDF() {
  const generatePDFFromLabels = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    console.log('📄 Iniciando generación de PDF con', packages.length, 'etiquetas');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter' // 8.5 x 11 inches
    });

    // Primero removemos la página inicial vacía
    let isFirstPage = true;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const labelData = labelsData.get(pkg.id);
      
      console.log(`📄 Procesando etiqueta ${i + 1}/${packages.length} para paquete ${pkg.id}`);

      if (!labelData) {
        console.error(`❌ No se encontraron datos de etiqueta para el paquete ${pkg.id}`);
        continue;
      }

      // Crear un contenedor temporal para renderizar la etiqueta
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'fixed';
      tempContainer.style.top = '-9999px';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '210mm'; // Ancho carta
      tempContainer.style.height = '297mm'; // Alto carta
      tempContainer.style.backgroundColor = 'white';
      tempContainer.style.display = 'flex';
      tempContainer.style.justifyContent = 'center';
      tempContainer.style.alignItems = 'center';
      tempContainer.style.padding = '20mm';
      tempContainer.style.boxSizing = 'border-box';

      // Crear el HTML de la etiqueta
      tempContainer.innerHTML = `
        <div style="
          width: 10cm;
          height: 15cm;
          backgroundColor: white;
          color: black;
          fontSize: 14px;
          fontFamily: Arial, sans-serif;
          display: flex;
          flexDirection: column;
          border: 2px solid #000;
          margin: 0;
          padding: 0;
          boxSizing: border-box;
        ">
          <!-- Header superior -->
          <div style="
            backgroundColor: white;
            padding: 8px;
            borderBottom: 2px solid #000;
            display: flex;
            justifyContent: space-between;
            alignItems: flex-start;
            minHeight: 60px;
          ">
            <div>
              <div style="fontSize: 24px; fontWeight: bold; lineHeight: 1;">E</div>
              <div style="fontSize: 12px; fontWeight: bold;">ENCOMIENDA</div>
              <div style="fontSize: 10px;">ZONA: ${pkg.origin.substring(0, 1)}</div>
            </div>
            <div style="textAlign: right; fontSize: 10px;">
              <div>#${pkg.tracking_number.substring(0, 12)}</div>
              <div>${new Date(pkg.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' })}</div>
              <div>DE: ${pkg.origin.substring(0, 6)}</div>
            </div>
          </div>

          <!-- Sección de servicio -->
          <div style="
            backgroundColor: white;
            padding: 8px;
            borderBottom: 2px solid #000;
            textAlign: center;
          ">
            <div style="fontSize: 14px; fontWeight: bold;">ENCOMIENDA EXPRESS</div>
          </div>

          <!-- Información del remitente y destinatario -->
          <div style="
            backgroundColor: white;
            padding: 12px;
            borderBottom: 2px solid #000;
            flexGrow: 1;
            display: flex;
            flexDirection: column;
            justifyContent: space-between;
          ">
            <div style="marginBottom: 8px;">
              <div style="fontSize: 10px; fontWeight: bold;">DESDE:</div>
              <div style="fontSize: 11px; wordWrap: break-word;">${pkg.origin}</div>
            </div>
            
            <div style="marginBottom: 8px;">
              <div style="fontSize: 10px; fontWeight: bold;">PARA:</div>
              <div style="fontSize: 13px; fontWeight: bold; wordWrap: break-word;">${pkg.customers?.name || 'CLIENTE'}</div>
              <div style="fontSize: 11px; wordWrap: break-word;">${pkg.destination}</div>
            </div>

            <div style="marginBottom: 8px;">
              <div style="fontSize: 10px; fontWeight: bold;">DESCRIPCIÓN:</div>
              <div style="fontSize: 10px; wordWrap: break-word; maxHeight: 50px; overflow: hidden;">${pkg.description}</div>
            </div>

            ${pkg.weight ? `
              <div style="fontSize: 10px;">
                <span style="fontWeight: bold;">PESO:</span> ${pkg.weight} kg
              </div>
            ` : ''}
          </div>

          <!-- Código de barras -->
          <div style="
            backgroundColor: white;
            padding: 8px;
            borderBottom: 2px solid #000;
            textAlign: center;
            minHeight: 80px;
            display: flex;
            flexDirection: column;
            justifyContent: center;
          ">
            <div style="fontSize: 10px; fontWeight: bold; marginBottom: 2px;">TRACKING #</div>
            <img src="${labelData.barcodeDataUrl}" alt="Barcode" style="
              width: 90%;
              height: 60px;
              objectFit: contain;
              margin: 0 auto;
            " />
          </div>

          <!-- QR Code -->
          <div style="
            backgroundColor: white;
            padding: 8px;
            display: flex;
            justifyContent: center;
            alignItems: center;
            minHeight: 90px;
          ">
            <div style="textAlign: center;">
              <img src="${labelData.qrCodeDataUrl}" alt="QR Code" style="
                width: 60px;
                height: 60px;
                marginBottom: 2px;
              " />
              <div style="fontSize: 8px;">Gestión digital</div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(tempContainer);

      try {
        // Convertir el contenedor a canvas
        const canvas = await html2canvas(tempContainer, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: 'white',
          width: 794, // Ancho en píxeles para carta (210mm)
          height: 1123 // Alto en píxeles para carta (297mm)
        });

        // Agregar nueva página si no es la primera
        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        // Agregar la imagen al PDF
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // Tamaño carta en mm

        console.log(`✅ Etiqueta ${i + 1} agregada al PDF`);
      } catch (error) {
        console.error(`❌ Error al procesar etiqueta ${i + 1}:`, error);
      } finally {
        // Limpiar el contenedor temporal
        document.body.removeChild(tempContainer);
      }
    }

    console.log('📄 PDF generado con', packages.length, 'páginas');
    return pdf;
  }, []);

  const printMultipleLabelsAsPDF = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    try {
      console.log('🖨️ Iniciando impresión de PDF con', packages.length, 'etiquetas');
      
      const pdf = await generatePDFFromLabels(packages, labelsData);
      
      // Abrir el PDF en una nueva ventana para imprimir
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Limpiar la URL después de un tiempo
            setTimeout(() => {
              URL.revokeObjectURL(pdfUrl);
            }, 1000);
          }, 500);
        };
      }
      
      console.log('✅ PDF abierto para impresión');
    } catch (error) {
      console.error('❌ Error al generar PDF para impresión:', error);
      throw error;
    }
  }, [generatePDFFromLabels]);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
