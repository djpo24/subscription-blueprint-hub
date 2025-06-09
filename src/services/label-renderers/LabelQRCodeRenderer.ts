
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export class LabelQRCodeRenderer {
  private pdf: jsPDF;
  private labelData: LabelData;

  constructor(pdf: jsPDF, labelData: LabelData) {
    this.pdf = pdf;
    this.labelData = labelData;
  }

  renderQRCode(currentY: number): number {
    const { startX, labelWidth, qrSize, qrPadding } = LABEL_DIMENSIONS;
    
    // QR Code centrado con marco - ajustado para el nuevo tamaño
    const qrX = startX + (labelWidth - qrSize) / 2;
    
    // Marco del QR
    this.pdf.setFillColor(249, 249, 249);
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.setLineWidth(0.3);
    this.pdf.roundedRect(qrX - qrPadding, currentY - qrPadding, qrSize + (qrPadding * 2), qrSize + (qrPadding * 2), 1, 1, 'FD');

    // QR Code
    try {
      this.pdf.addImage(
        this.labelData.qrCodeDataUrl, 
        'PNG', 
        qrX, 
        currentY, 
        qrSize, 
        qrSize
      );
    } catch (error) {
      console.error('Error agregando QR code:', error);
    }

    return currentY + qrSize + qrPadding + SPACING.sectionSpacing;
  }
}
