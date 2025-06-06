
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
  amount_to_collect?: number | null;
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('COP', '').trim();
  };

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
      pdf.setLineWidth(0.3);
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(startX, startY, labelWidth, labelHeight);

      let currentY = startY + 16;

      // Header
      // ENVIOS OJITO (izquierda)
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ENVIOS OJITO', startX + 5, currentY);
      
      // Tracking number (derecha)
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      const trackingText = pkg.tracking_number;
      const trackingWidth = pdf.getTextWidth(trackingText);
      pdf.text(trackingText, startX + labelWidth - trackingWidth - 5, currentY);

      currentY += 6;

      // Cliente (izquierda)
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      pdf.text(pkg.customers?.name || 'Cliente', startX + 5, currentY);

      // Fecha (derecha)
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      const date = new Date(pkg.created_at);
      const monthName = months[date.getMonth()];
      const dateText = `${monthName} ${date.getDate()}/${date.getFullYear().toString().slice(-2)}`;
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, startX + labelWidth - dateWidth - 5, currentY);

      currentY += 20;

      // QR Code centrado con marco
      pdf.setTextColor(0, 0, 0);
      const qrBoxSize = 50;
      const qrBoxX = startX + (labelWidth - qrBoxSize) / 2;
      
      // Marco del QR
      pdf.setFillColor(249, 249, 249);
      pdf.setDrawColor(220, 220, 220);
      pdf.roundedRect(qrBoxX - 4, currentY - 4, qrBoxSize + 8, qrBoxSize + 8, 2, 2, 'FD');

      // QR Code
      try {
        const qrSize = 45;
        const qrX = startX + (labelWidth - qrSize) / 2;
        pdf.addImage(
          labelData.qrCodeDataUrl, 
          'PNG', 
          qrX, 
          currentY, 
          qrSize, 
          qrSize
        );
      } catch (error) {
        console.error('Error agregando QR code:', error);
      }

      currentY += qrBoxSize + 16;

      // Peso y Total
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      
      // Peso (izquierda)
      const pesoText = `Peso: ${pkg.weight ? pkg.weight + 'kg' : '0kg'}`;
      pdf.text(pesoText, startX + 5, currentY);

      // Total (derecha)
      const totalAmount = pkg.amount_to_collect ? formatCurrency(pkg.amount_to_collect) : '0';
      const totalText = `Total: ₡${totalAmount}`;
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, startX + labelWidth - totalWidth - 5, currentY);

      currentY += 12;

      // Texto informativo centrado
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      
      const infoLines = [
        'Toda encomienda debe ser verificada en el local al',
        'momento de la entrega. Una vez entregada, no se',
        'aceptan reclamos.'
      ];

      infoLines.forEach((line, index) => {
        const lineWidth = pdf.getTextWidth(line);
        const lineX = startX + (labelWidth - lineWidth) / 2;
        pdf.text(line, lineX, currentY + (index * 4));
      });

      currentY += 16;

      // Direcciones centradas
      pdf.setFontSize(7);
      
      // Dirección Barranquilla
      pdf.setFont('helvetica', 'bold');
      let addressLine = 'Dirección en B/QUILLA: Calle 45B # 22 - 124';
      let addressWidth = pdf.getTextWidth(addressLine);
      pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
      
      currentY += 4;
      pdf.setFont('helvetica', 'normal');
      let phoneLine = 'Tel: +5731272717446';
      let phoneWidth = pdf.getTextWidth(phoneLine);
      pdf.text(phoneLine, startX + (labelWidth - phoneWidth) / 2, currentY);

      currentY += 6;

      // Dirección Curacao
      pdf.setFont('helvetica', 'bold');
      addressLine = 'Dirección Curacao: Jo corsenstraat 48 brievengat';
      addressWidth = pdf.getTextWidth(addressLine);
      pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
      
      currentY += 4;
      pdf.setFont('helvetica', 'normal');
      phoneLine = 'Tel: +599 9 6964306';
      phoneWidth = pdf.getTextWidth(phoneLine);
      pdf.text(phoneLine, startX + (labelWidth - phoneWidth) / 2, currentY);

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
