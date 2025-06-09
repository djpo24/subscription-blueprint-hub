
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

interface Package {
  tracking_number: string;
}

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export class LabelBarcodeRenderer {
  private pdf: jsPDF;
  private pkg: Package;
  private labelData: LabelData;

  constructor(pdf: jsPDF, pkg: Package, labelData: LabelData) {
    this.pdf = pdf;
    this.pkg = pkg;
    this.labelData = labelData;
  }

  renderBarcode(currentY: number): void {
    const { startX, labelWidth, barcodeWidth, barcodeHeight } = LABEL_DIMENSIONS;
    
    // Código de barras en la parte inferior de la etiqueta
    const barcodeX = startX + (labelWidth - barcodeWidth) / 2;
    
    // Línea separadora antes del código de barras
    this.pdf.setLineWidth(0.2);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.line(startX + 10, currentY, startX + labelWidth - 10, currentY);
    
    currentY += SPACING.headerSpacing;

    // Código de barras centrado
    try {
      this.pdf.addImage(
        this.labelData.barcodeDataUrl,
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
    this.pdf.setFontSize(7);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    const trackingNumberWidth = this.pdf.getTextWidth(this.pkg.tracking_number);
    this.pdf.text(this.pkg.tracking_number, startX + (labelWidth - trackingNumberWidth) / 2, currentY);
  }
}
