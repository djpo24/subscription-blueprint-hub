
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

export class LabelAddressRenderer {
  private pdf: jsPDF;

  constructor(pdf: jsPDF) {
    this.pdf = pdf;
  }

  renderAddresses(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Direcciones centradas
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(0, 0, 0);
    
    // Dirección Barranquilla
    this.pdf.setFont('helvetica', 'bold');
    let addressLine = 'Dirección en B/QUILLA: Calle 45B # 22 - 124';
    let addressWidth = this.pdf.getTextWidth(addressLine);
    this.pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
    
    currentY += SPACING.smallSpacing;
    this.pdf.setFont('helvetica', 'normal');
    let phoneLine = 'Tel: +5731272717446';
    let phoneWidth = this.pdf.getTextWidth(phoneLine);
    this.pdf.text(phoneLine, startX + (labelWidth - phoneWidth) / 2, currentY);

    currentY += SPACING.headerSpacing;

    // Dirección Curacao
    this.pdf.setFont('helvetica', 'bold');
    addressLine = 'Dirección Curacao: Jo corsenstraat 48 brievengat';
    addressWidth = this.pdf.getTextWidth(addressLine);
    this.pdf.text(addressLine, startX + (labelWidth - addressWidth) / 2, currentY);
    
    currentY += SPACING.smallSpacing;
    this.pdf.setFont('helvetica', 'normal');
    phoneLine = 'Tel: +599 9 6964306';
    phoneWidth = this.pdf.getTextWidth(phoneLine);
    this.pdf.text(phoneLine, startX + (labelWidth - phoneWidth) / 2, currentY);

    return currentY + SPACING.sectionSpacing;
  }
}
