
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
  amount_to_collect?: number;
  currency?: 'COP' | 'AWG';
  customers?: {
    name: string;
    email: string;
  };
  trip?: {
    trip_date: string;
  };
}

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function useMultipleLabelsPDF() {
  const formatTravelDate = (dateString: string) => {
    try {
      const tripDate = new Date(dateString);
      
      if (!isNaN(tripDate.getTime())) {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        return `${monthNames[tripDate.getMonth()]} ${tripDate.getDate()}/${tripDate.getFullYear().toString().slice(2)}`;
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    
    // Fallback a fecha actual
    const fallbackDate = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${monthNames[fallbackDate.getMonth()]} ${fallbackDate.getDate()}/${fallbackDate.getFullYear().toString().slice(2)}`;
  };

  const formatAmountToCollect = (pkg: Package) => {
    if (!pkg.amount_to_collect || pkg.amount_to_collect === 0) {
      return 'Total: $0';
    }
    
    const symbol = pkg.currency === 'AWG' ? 'ƒ' : '$';
    const formattedAmount = pkg.amount_to_collect.toLocaleString('es-CO');
    return `Total: ${symbol}${formattedAmount}`;
  };

  const formatWeight = (pkg: Package) => {
    if (!pkg.weight) {
      return 'Peso: N/A';
    }
    return `Peso: ${pkg.weight}kg`;
  };

  const addLabelToPDF = (
    pdf: jsPDF, 
    pkg: Package, 
    labelData: LabelData,
    pageWidth: number,
    pageHeight: number
  ) => {
    console.log(`📄 Creando etiqueta para paquete ${pkg.id} directamente en PDF`);
    
    // Dimensiones de la etiqueta (10cm x 15cm convertidos a puntos)
    const labelWidth = 283.46; // 10cm en puntos
    const labelHeight = 425.2; // 15cm en puntos
    
    // Centrar la etiqueta en la página
    const startX = (pageWidth - labelWidth) / 2;
    const startY = (pageHeight - labelHeight) / 2;
    
    let currentY = startY;
    
    // Borde de la etiqueta
    pdf.setDrawColor(221, 221, 221);
    pdf.setLineWidth(1);
    pdf.rect(startX, startY, labelWidth, labelHeight);
    
    // HEADER - "ENVIOS OJITO" y tracking number
    currentY += 30;
    
    // "ENVIOS OJITO" a la izquierda
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(51, 51, 51);
    pdf.text('ENVIOS OJITO', startX + 20, currentY);
    
    // Tracking number a la derecha
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(102, 102, 102);
    const trackingWidth = pdf.getTextWidth(pkg.tracking_number);
    pdf.text(pkg.tracking_number, startX + labelWidth - trackingWidth - 20, currentY);
    
    currentY += 25;
    
    // Nombre del cliente a la izquierda y fecha del viaje a la derecha
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(18);
    pdf.setTextColor(102, 102, 102);
    
    const customerName = pkg.customers?.name || 'CLIENTE';
    pdf.text(customerName, startX + 20, currentY);
    
    const formattedTravelDate = pkg.trip?.trip_date ? formatTravelDate(pkg.trip.trip_date) : formatTravelDate(new Date().toISOString());
    pdf.setFontSize(16);
    const dateWidth = pdf.getTextWidth(formattedTravelDate);
    pdf.text(formattedTravelDate, startX + labelWidth - dateWidth - 20, currentY);
    
    currentY += 25;
    
    // Línea separadora
    pdf.setDrawColor(238, 238, 238);
    pdf.setLineWidth(0.5);
    pdf.line(startX + 15, currentY, startX + labelWidth - 15, currentY);
    
    currentY += 20;
    
    // QR Code centrado
    if (labelData.qrCodeDataUrl) {
      try {
        const qrSize = 120; // Tamaño del QR code
        const qrX = startX + (labelWidth - qrSize) / 2;
        
        // Borde alrededor del QR
        pdf.setDrawColor(221, 221, 221);
        pdf.setLineWidth(2);
        pdf.rect(qrX - 10, currentY - 10, qrSize + 20, qrSize + 20);
        
        // Agregar QR code
        pdf.addImage(
          labelData.qrCodeDataUrl, 
          'PNG', 
          qrX, 
          currentY, 
          qrSize, 
          qrSize
        );
        
        currentY += qrSize + 30;
      } catch (error) {
        console.error('Error agregando QR code al PDF:', error);
        currentY += 120;
      }
    }
    
    // Línea separadora
    pdf.setDrawColor(238, 238, 238);
    pdf.setLineWidth(0.5);
    pdf.line(startX + 15, currentY, startX + labelWidth - 15, currentY);
    
    currentY += 20;
    
    // Peso a la izquierda y monto a cobrar a la derecha
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    
    const weightText = formatWeight(pkg);
    pdf.text(weightText, startX + 20, currentY);
    
    const amountText = formatAmountToCollect(pkg);
    pdf.setFont('helvetica', 'bold');
    const amountWidth = pdf.getTextWidth(amountText);
    pdf.text(amountText, startX + labelWidth - amountWidth - 20, currentY);
    
    currentY += 25;
    
    // Disclaimer
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    const disclaimerText = 'Toda encomienda debe ser verificada en el local al momento de la entrega. Una vez entregada, no se aceptan reclamos.';
    const disclaimerLines = pdf.splitTextToSize(disclaimerText, labelWidth - 40);
    
    disclaimerLines.forEach((line: string, index: number) => {
      const lineWidth = pdf.getTextWidth(line);
      const lineX = startX + (labelWidth - lineWidth) / 2;
      pdf.text(line, lineX, currentY + (index * 12));
    });
    
    currentY += disclaimerLines.length * 12 + 15;
    
    // Información de contacto
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    const contactInfo = [
      'Dirección en B/QUILLA: Calle 45B # 22 - 124',
      'Tel: +573127271746',
      'Dirección Curacao: Jo corsenstraat 48 brievengat',
      'Tel: +599 9 6964306'
    ];
    
    contactInfo.forEach((info, index) => {
      const infoWidth = pdf.getTextWidth(info);
      const infoX = startX + (labelWidth - infoWidth) / 2;
      pdf.text(info, infoX, currentY + (index * 10));
    });
    
    console.log(`✅ Etiqueta para paquete ${pkg.id} creada correctamente en PDF`);
  };

  const generatePDFFromLabels = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    console.log('📄 Iniciando generación de PDF con jsPDF nativo para', packages.length, 'etiquetas');
    
    // Crear PDF con páginas tamaño carta
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter' // 8.5" x 11"
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    console.log(`📄 Dimensiones de página: ${pageWidth}pt x ${pageHeight}pt`);

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

      // Agregar la etiqueta centrada en la página
      addLabelToPDF(pdf, pkg, labelData, pageWidth, pageHeight);
    }

    console.log('📄 PDF generado exitosamente con jsPDF nativo -', packages.length, 'páginas');
    return pdf;
  }, []);

  const printMultipleLabelsAsPDF = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    try {
      console.log('🖨️ Iniciando impresión de PDF con jsPDF nativo para', packages.length, 'etiquetas');
      
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
      
      console.log('✅ PDF con jsPDF nativo abierto para impresión');
    } catch (error) {
      console.error('❌ Error al generar PDF con jsPDF nativo para impresión:', error);
      throw error;
    }
  }, [generatePDFFromLabels]);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
