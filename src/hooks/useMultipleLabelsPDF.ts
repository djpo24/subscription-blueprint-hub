
import { useCallback } from 'react';
import jsPDF from 'jspdf';

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
      format: 'letter'
    });

    let isFirstPage = true;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const labelData = labelsData.get(pkg.id);
      
      console.log(`📄 Procesando etiqueta ${i + 1}/${packages.length} para paquete ${pkg.id}`);

      if (!labelData) {
        console.error(`❌ No se encontraron datos de etiqueta para el paquete ${pkg.id}`);
        continue;
      }

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Configurar fuente
      pdf.setFont('helvetica');
      
      // Dimensiones de la etiqueta (centrada en página carta)
      const pageWidth = 216; // mm (carta)
      const pageHeight = 279; // mm (carta)
      const labelWidth = 100; // mm (10cm)
      const labelHeight = 150; // mm (15cm)
      const startX = (pageWidth - labelWidth) / 2;
      const startY = (pageHeight - labelHeight) / 2;

      // Dibujar borde principal de la etiqueta
      pdf.setLineWidth(0.5);
      pdf.rect(startX, startY, labelWidth, labelHeight);

      let currentY = startY;

      // Header superior
      const headerHeight = 25;
      pdf.rect(startX, currentY, labelWidth, headerHeight);
      
      // Logo "E" y texto ENCOMIENDA
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('E', startX + 5, currentY + 15);
      
      pdf.setFontSize(8);
      pdf.text('ENCOMIENDA', startX + 5, currentY + 20);
      pdf.setFontSize(6);
      pdf.text(`ZONA: ${pkg.origin.substring(0, 1)}`, startX + 5, currentY + 23);

      // Información derecha del header
      pdf.setFontSize(6);
      pdf.text(`#${pkg.tracking_number.substring(0, 12)}`, startX + labelWidth - 25, currentY + 8);
      pdf.text(new Date(pkg.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: '2-digit' }), startX + labelWidth - 25, currentY + 12);
      pdf.text(`DE: ${pkg.origin.substring(0, 6)}`, startX + labelWidth - 25, currentY + 16);

      currentY += headerHeight;

      // Sección de servicio
      const serviceHeight = 10;
      pdf.rect(startX, currentY, labelWidth, serviceHeight);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const serviceText = 'ENCOMIENDA EXPRESS';
      const serviceTextWidth = pdf.getTextWidth(serviceText);
      pdf.text(serviceText, startX + (labelWidth - serviceTextWidth) / 2, currentY + 7);

      currentY += serviceHeight;

      // Información del remitente y destinatario
      const infoHeight = 55;
      pdf.rect(startX, currentY, labelWidth, infoHeight);
      
      let infoY = currentY + 8;
      
      // DESDE
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESDE:', startX + 5, infoY);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const fromLines = pdf.splitTextToSize(pkg.origin, labelWidth - 15);
      pdf.text(fromLines, startX + 5, infoY + 4);
      
      infoY += 15;
      
      // PARA - usar el mismo formato que el QR de prueba
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PARA:', startX + 5, infoY);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      const customerName = pkg.customers?.name || 'CLIENTE';
      const customerLines = pdf.splitTextToSize(customerName, labelWidth - 15);
      pdf.text(customerLines, startX + 5, infoY + 4);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      const toLines = pdf.splitTextToSize(pkg.destination, labelWidth - 15);
      pdf.text(toLines, startX + 5, infoY + 10);
      
      infoY += 20;
      
      // DESCRIPCIÓN
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DESCRIPCIÓN:', startX + 5, infoY);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      const descLines = pdf.splitTextToSize(pkg.description, labelWidth - 15);
      pdf.text(descLines.slice(0, 3), startX + 5, infoY + 4); // Máximo 3 líneas
      
      // PESO (si existe)
      if (pkg.weight) {
        pdf.setFontSize(6);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`PESO: `, startX + 5, infoY + 15);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`${pkg.weight} kg`, startX + 15, infoY + 15);
      }

      currentY += infoHeight;

      // Código de barras
      const barcodeHeight = 25;
      pdf.rect(startX, currentY, labelWidth, barcodeHeight);
      
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'bold');
      const trackingText = 'TRACKING #';
      const trackingTextWidth = pdf.getTextWidth(trackingText);
      pdf.text(trackingText, startX + (labelWidth - trackingTextWidth) / 2, currentY + 6);

      // Agregar imagen del código de barras
      try {
        pdf.addImage(
          labelData.barcodeDataUrl, 
          'PNG', 
          startX + 5, 
          currentY + 8, 
          labelWidth - 10, 
          15
        );
      } catch (error) {
        console.error('Error agregando código de barras:', error);
      }

      currentY += barcodeHeight;

      // QR Code
      const qrHeight = 25;
      pdf.rect(startX, currentY, labelWidth, qrHeight);
      
      try {
        // Centrar QR Code
        const qrSize = 15;
        const qrX = startX + (labelWidth - qrSize) / 2;
        pdf.addImage(
          labelData.qrCodeDataUrl, 
          'PNG', 
          qrX, 
          currentY + 3, 
          qrSize, 
          qrSize
        );
        
        // Texto "Gestión digital"
        pdf.setFontSize(5);
        pdf.setFont('helvetica', 'normal');
        const digitalText = 'Gestión digital';
        const digitalTextWidth = pdf.getTextWidth(digitalText);
        pdf.text(digitalText, startX + (labelWidth - digitalTextWidth) / 2, currentY + 22);
      } catch (error) {
        console.error('Error agregando QR code:', error);
      }

      console.log(`✅ Etiqueta ${i + 1} agregada al PDF`);
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
