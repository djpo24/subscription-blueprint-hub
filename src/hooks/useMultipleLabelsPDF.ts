
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}/${year}`;
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

      // Header - ENVIOS OJITO y tracking number en la misma línea
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ENVIOS OJITO', startX + 5, currentY);
      
      // Tracking number (derecha, misma línea)
      const trackingText = pkg.tracking_number;
      const trackingWidth = pdf.getTextWidth(trackingText);
      pdf.text(trackingText, startX + labelWidth - trackingWidth - 5, currentY);

      currentY += 8;

      // Segunda línea - Cliente y fecha
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      // Cliente (izquierda)
      pdf.text(pkg.customers?.name || 'Cliente', startX + 5, currentY);

      // Fecha (derecha)
      const dateText = formatDate(pkg.created_at);
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, startX + labelWidth - dateWidth - 5, currentY);

      currentY += 24;

      // QR Code centrado con marco
      pdf.setTextColor(0, 0, 0);
      const qrBoxSize = 45;
      const qrBoxX = startX + (labelWidth - qrBoxSize) / 2;
      
      // Marco del QR
      pdf.setFillColor(249, 249, 249);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(qrBoxX - 3, currentY - 3, qrBoxSize + 6, qrBoxSize + 6, 2, 2, 'FD');

      // QR Code
      try {
        const qrSize = 40;
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

      currentY += qrBoxSize + 20;

      // Peso y Total en líneas separadas
      pdf.setFontSize(12);
      pdf.setTextColor(0, 0, 0);
      
      // Peso (izquierda)
      pdf.setFont('helvetica', 'bold');
      const pesoLabel = 'Peso: ';
      pdf.text(pesoLabel, startX + 5, currentY);
      
      pdf.setFont('helvetica', 'normal');
      const pesoValue = pkg.weight ? `${pkg.weight}kg` : '3kg';
      const pesoLabelWidth = pdf.getTextWidth(pesoLabel);
      pdf.text(pesoValue, startX + 5 + pesoLabelWidth, currentY);

      currentY += 8;

      // Total (derecha)
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      const totalAmount = pkg.amount_to_collect ? formatCurrency(pkg.amount_to_collect) : '34.543.545';
      const totalText = `Total: ₡${totalAmount}`;
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, startX + labelWidth - totalWidth - 5, currentY);

      currentY += 20;

      // Texto informativo centrado
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      
      const infoLines = [
        'Toda encomienda debe ser verificada en el local al',
        'momento de la entrega. Una vez entregada, no se',
        'aceptan reclamos.'
      ];

      infoLines.forEach((line, index) => {
        const lineWidth = pdf.getTextWidth(line);
        const lineX = startX + (labelWidth - lineWidth) / 2;
        pdf.text(line, lineX, currentY + (index * 3.5));
      });

      currentY += 16;

      // Direcciones centradas
      pdf.setFontSize(7.5);
      pdf.setTextColor(0, 0, 0);
      
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
