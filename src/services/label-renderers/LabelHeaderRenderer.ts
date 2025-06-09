
import jsPDF from 'jspdf';
import { formatDate } from '@/utils/labelFormatters';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

interface Package {
  id: string;
  tracking_number: string;
  customers?: {
    name: string;
    email: string;
  };
  created_at: string;
}

export class LabelHeaderRenderer {
  private pdf: jsPDF;
  private pkg: Package;

  constructor(pdf: jsPDF, pkg: Package) {
    this.pdf = pdf;
    this.pkg = pkg;
  }

  renderHeader(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Header - ENVIOS OJITO y tracking number
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('ENVIOS OJITO', startX + 3, currentY);
    
    const trackingText = this.pkg.tracking_number;
    const trackingWidth = this.pdf.getTextWidth(trackingText);
    this.pdf.text(trackingText, startX + labelWidth - trackingWidth - 3, currentY);

    return currentY + SPACING.headerSpacing;
  }

  renderCustomerAndDate(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Segunda línea - Cliente y fecha con tamaño aumentado a 10pt (era 8pt)
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    this.pdf.text(this.pkg.customers?.name || 'Cliente', startX + 3, currentY);

    const dateText = formatDate(this.pkg.created_at);
    const dateWidth = this.pdf.getTextWidth(dateText);
    this.pdf.text(dateText, startX + labelWidth - dateWidth - 3, currentY);

    // Eliminar la línea negra que estaba debajo del nombre y fecha
    // this.pdf.setLineWidth(3);
    // this.pdf.setDrawColor(0, 0, 0);
    // this.pdf.line(startX + 3, currentY + 2, startX + labelWidth - 3, currentY + 2);

    return currentY + SPACING.sectionSpacing;
  }
}
