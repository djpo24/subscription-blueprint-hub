
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

  const generatePDFFromLabels = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    console.log('📄 Iniciando generación de PDF mejorado con', packages.length, 'etiquetas');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [100, 150] // 10cm x 15cm
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

      let yPosition = 10;

      // Header - ENVIOS OJITO y tracking number
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.text('ENVIOS OJITO', 15, yPosition + 10);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      const trackingTextWidth = pdf.getTextWidth(pkg.tracking_number);
      pdf.text(pkg.tracking_number, 100 - trackingTextWidth - 5, yPosition + 10);

      yPosition += 15;

      // Nombre del cliente y fecha del viaje
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(18);
      const customerName = pkg.customers?.name || 'CLIENTE';
      pdf.text(customerName, 15, yPosition + 5);

      const formattedTravelDate = pkg.trip?.trip_date ? formatTravelDate(pkg.trip.trip_date) : formatTravelDate(new Date().toISOString());
      pdf.setFontSize(16);
      const dateTextWidth = pdf.getTextWidth(formattedTravelDate);
      pdf.text(formattedTravelDate, 100 - dateTextWidth - 5, yPosition + 5);

      yPosition += 15;

      // Línea separadora
      pdf.setLineWidth(0.2);
      pdf.line(10, yPosition, 90, yPosition);
      yPosition += 10;

      // QR Code centrado
      if (labelData.qrCodeDataUrl) {
        try {
          const qrSize = 45;
          const qrX = (100 - qrSize) / 2;
          
          // Borde alrededor del QR
          pdf.setLineWidth(0.5);
          pdf.rect(qrX - 3, yPosition - 3, qrSize + 6, qrSize + 6);
          
          pdf.addImage(
            labelData.qrCodeDataUrl, 
            'PNG', 
            qrX, 
            yPosition, 
            qrSize, 
            qrSize
          );
          
          yPosition += qrSize + 10;
        } catch (error) {
          console.error('Error agregando QR code:', error);
          yPosition += 50;
        }
      }

      // Línea separadora
      pdf.setLineWidth(0.2);
      pdf.line(10, yPosition, 90, yPosition);
      yPosition += 8;

      // Peso y monto a cobrar
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(16);
      const weightText = formatWeight(pkg);
      pdf.text(weightText, 15, yPosition);

      const amountText = formatAmountToCollect(pkg);
      pdf.setFont('helvetica', 'bold');
      const amountTextWidth = pdf.getTextWidth(amountText);
      pdf.text(amountText, 100 - amountTextWidth - 5, yPosition);

      yPosition += 10;

      // Disclaimer
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      const disclaimerText = 'Toda encomienda debe ser verificada en el local al momento de la entrega. Una vez entregada, no se aceptan reclamos.';
      const disclaimerLines = pdf.splitTextToSize(disclaimerText, 80);
      
      for (let j = 0; j < disclaimerLines.length; j++) {
        const lineWidth = pdf.getTextWidth(disclaimerLines[j]);
        pdf.text(disclaimerLines[j], (100 - lineWidth) / 2, yPosition + (j * 4));
      }
      yPosition += disclaimerLines.length * 4 + 5;

      // Información de contacto
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(11);
      
      const contactInfo = [
        'Dirección en B/QUILLA: Calle 45B # 22 - 124',
        'Tel: +573127271746',
        'Dirección Curacao: Jo corsenstraat 48 brievengat',
        'Tel: +599 9 6964306'
      ];

      contactInfo.forEach((info, index) => {
        const infoWidth = pdf.getTextWidth(info);
        pdf.text(info, (100 - infoWidth) / 2, yPosition + (index * 3.5));
      });

      console.log(`✅ Etiqueta ${i + 1} generada correctamente en PDF`);
    }

    console.log('📄 PDF generado exitosamente con', packages.length, 'páginas');
    return pdf;
  }, []);

  const printMultipleLabelsAsPDF = useCallback(async (
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ) => {
    try {
      console.log('🖨️ Iniciando impresión de PDF mejorado con', packages.length, 'etiquetas');
      
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
      
      console.log('✅ PDF mejorado abierto para impresión');
    } catch (error) {
      console.error('❌ Error al generar PDF mejorado para impresión:', error);
      throw error;
    }
  }, [generatePDFFromLabels]);

  return {
    generatePDFFromLabels,
    printMultipleLabelsAsPDF
  };
}
