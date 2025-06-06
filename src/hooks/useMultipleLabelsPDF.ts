
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
  currency?: string;
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
  const formatAmount = (amount: number, currency?: string) => {
    // Solo formatear el número sin símbolo de moneda
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrencySymbol = (currency?: string) => {
    return currency === 'AWG' ? 'ƒ' : '$';
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
      format: [102, 152] // Tamaño personalizado: 102mm x 152mm
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
      
      // Dimensiones de la etiqueta - ahora ocupa toda la página
      const pageWidth = 102; // mm
      const pageHeight = 152; // mm
      const labelWidth = 96; // mm (dejando 3mm de margen a cada lado)
      const labelHeight = 146; // mm (dejando 3mm de margen arriba y abajo)
      const startX = 3; // mm (margen izquierdo)
      const startY = 3; // mm (margen superior)

      // Dibujar borde principal de la etiqueta
      pdf.setLineWidth(0.5);
      pdf.setDrawColor(180, 180, 180);
      pdf.rect(startX, startY, labelWidth, labelHeight);

      let currentY = startY + 10;

      // Header - ENVIOS OJITO y tracking number
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text('ENVIOS OJITO', startX + 3, currentY);
      
      const trackingText = pkg.tracking_number;
      const trackingWidth = pdf.getTextWidth(trackingText);
      pdf.text(trackingText, startX + labelWidth - trackingWidth - 3, currentY);

      currentY += 5;

      // Segunda línea - Cliente y fecha
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      pdf.text(pkg.customers?.name || 'Cliente', startX + 3, currentY);

      const dateText = formatDate(pkg.created_at);
      const dateWidth = pdf.getTextWidth(dateText);
      pdf.text(dateText, startX + labelWidth - dateWidth - 3, currentY);

      currentY += 8;

      // QR Code centrado con marco - ajustado para el nuevo tamaño
      const qrSize = 45; // Reducido para encajar mejor
      const qrPadding = 3;
      const qrX = startX + (labelWidth - qrSize) / 2;
      
      // Marco del QR
      pdf.setFillColor(249, 249, 249);
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(qrX - qrPadding, currentY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 1, 1, 'FD');

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

      currentY += qrSize + qrPadding + 8;

      // Peso y Total en la misma línea
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      
      // Peso (izquierda)
      const pesoText = `Peso: ${pkg.weight ? `${pkg.weight}kg` : '3kg'}`;
      pdf.text(pesoText, startX + 3, currentY);
      
      // Total (derecha)
      const totalAmount = pkg.amount_to_collect ? formatAmount(pkg.amount_to_collect, pkg.currency) : '34.354.435';
      const currencySymbol = getCurrencySymbol(pkg.currency);
      const totalText = `Total: ${currencySymbol}${totalAmount}`;
      const totalWidth = pdf.getTextWidth(totalText);
      pdf.text(totalText, startX + labelWidth - totalWidth - 3, currentY);

      currentY += 8;

      // Texto informativo centrado
      pdf.setFontSize(9);
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

      currentY += 8;

      // Direcciones centradas
      pdf.setFontSize(8);
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

      currentY += 8;

      // Código de barras en la parte inferior de la etiqueta
      const barcodeWidth = 70; // mm
      const barcodeHeight = 15; // mm
      const barcodeX = startX + (labelWidth - barcodeWidth) / 2;
      
      // Línea separadora antes del código de barras
      pdf.setLineWidth(0.2);
      pdf.setDrawColor(200, 200, 200);
      pdf.line(startX + 10, currentY, startX + labelWidth - 10, currentY);
      
      currentY += 5;

      // Código de barras centrado
      try {
        pdf.addImage(
          labelData.barcodeDataUrl,
          'PNG',
          barcodeX,
          currentY,
          barcodeWidth,
          barcodeHeight
        );
      } catch (error) {
        console.error('Error agregando código de barras:', error);
      }

      currentY += barcodeHeight + 2;

      // Texto del tracking number debajo del código de barras
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      const trackingNumberWidth = pdf.getTextWidth(pkg.tracking_number);
      pdf.text(pkg.tracking_number, startX + (labelWidth - trackingNumberWidth) / 2, currentY);

      console.log(`✅ Etiqueta ${i + 1} agregada al PDF con código de barras`);
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
