
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
      
      // Dimensiones de la etiqueta centrada en la página
      const pageWidth = 216; // mm (carta)
      const pageHeight = 279; // mm (carta)
      const labelWidth = 100; // mm
      const labelHeight = 150; // mm
      const startX = (pageWidth - labelWidth) / 2;
      const startY = (pageHeight - labelHeight) / 2;

      // Dibujar borde principal de la etiqueta
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(startX, startY, labelWidth, labelHeight);

      let currentY = startY + 12;

      // Header - ENVIOS OJITO y tracking number
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('ENVIOS OJITO', startX + 5, currentY);
      
      const trackingText = pkg.tracking_number;
      const trackingWidth = pdf.getTextWidth(trackingText);
      pdf.text(trackingText, startX + labelWidth - trackingWidth - 5, currentY);

      currentY += 6;

      // Segunda línea - Cliente y fecha
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      pdf.text(pkg.customers?.name || 'Cliente', startX + 5, currentY);

      const dateText = formatDate(pkg.created_at);
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, startX + labelWidth - dateWidth - 5, currentY);

      currentY += 18;

      // QR Code centrado con marco - aumentado de 35mm a 42mm (aproximadamente 7mm más, equivalente a 20px)
      const qrSize = 42;
      const qrX = startX + (labelWidth - qrSize) / 2;
      
      // Marco del QR
      pdf.setFillColor(249, 249, 249);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(qrX - 2, currentY - 2, qrSize + 4, qrSize + 4, 1, 1, 'FD');

      // QR Code
      try {
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

      currentY += qrSize + 18;

      // Peso (izquierda)
      pdf.setFontSize(11);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      const pesoLabel = 'Peso: ';
      pdf.text(pesoLabel, startX + 5, currentY);
      
      pdf.setFont('helvetica', 'normal');
      const pesoValue = pkg.weight ? `${pkg.weight}kg` : '5kg';
      const pesoLabelWidth = pdf.getTextWidth(pesoLabel);
      pdf.text(pesoValue, startX + 5 + pesoLabelWidth, currentY);

      currentY += 8;

      // Total (derecha)
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      const totalAmount = pkg.amount_to_collect ? formatCurrency(pkg.amount_to_collect) : '34.354.435';
      const totalText = `Total: ¡$${totalAmount}`;
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, startX + labelWidth - totalWidth - 5, currentY);

      currentY += 16;

      // Texto informativo centrado
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      
      const infoText = 'Toda encomienda debe ser verificada en el local al';
      const infoText2 = 'momento de la entrega. Una vez entregada, no se';
      const infoText3 = 'aceptan reclamos.';

      let infoWidth = pdf.getTextWidth(infoText);
      pdf.text(infoText, startX + (labelWidth - infoWidth) / 2, currentY);
      
      currentY += 3;
      infoWidth = pdf.getTextWidth(infoText2);
      pdf.text(infoText2, startX + (labelWidth - infoWidth) / 2, currentY);
      
      currentY += 3;
      infoWidth = pdf.getTextWidth(infoText3);
      pdf.text(infoText3, startX + (labelWidth - infoWidth) / 2, currentY);

      currentY += 12;

      // Direcciones centradas
      pdf.setFontSize(6.5);
      pdf.setTextColor(0, 0, 0);
      
      // Dirección Barranquilla
      pdf.setFont('helvetica', 'bold');
      let addressLine = 'Dirección en B/QUILLA: Calle 45B # 22 - 124';
      let addressWidth = pdf.getTextWidth(addressLine);
      pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
      
      currentY += 3;
      pdf.setFont('helvetica', 'normal');
      let phoneLine = 'Tel: +5731272717446';
      let phoneWidth = pdf.getTextWidth(phoneLine);
      pdf.text(phoneLine, startX + (labelWidth - phoneWidth) / 2, currentY);

      currentY += 5;

      // Dirección Curacao
      pdf.setFont('helvetica', 'bold');
      addressLine = 'Dirección Curacao: Jo corsenstraat 48 brievengat';
      addressWidth = pdf.getTextWidth(addressLine);
      pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
      
      currentY += 3;
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
