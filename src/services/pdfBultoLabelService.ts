import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';

interface Bulto {
  id: string;
  bulto_number: number;
}

export class PDFBultoLabelService {
  static async generatePDF(bulto: Bulto): Promise<jsPDF> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [LABEL_DIMENSIONS.pageWidth, LABEL_DIMENSIONS.pageHeight]
    });

    // Set font for the bulto number
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(180);
    
    // Calculate center position
    const centerX = LABEL_DIMENSIONS.pageWidth / 2;
    const centerY = LABEL_DIMENSIONS.pageHeight / 2;
    
    // Draw the bulto number centered
    pdf.text(bulto.bulto_number.toString(), centerX, centerY, {
      align: 'center',
      baseline: 'middle'
    });

    return pdf;
  }

  static async printPDF(bulto: Bulto): Promise<void> {
    console.log('🖨️ [PDFBultoLabelService] Generando etiqueta de bulto:', bulto.bulto_number);
    
    const pdf = await this.generatePDF(bulto);
    
    // Open PDF in new window for printing
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          // Clean up URL after a delay
          setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
          }, 1000);
        }, 500);
      };
    }
    
    console.log('✅ [PDFBultoLabelService] Etiqueta de bulto abierta para impresión');
  }
}
