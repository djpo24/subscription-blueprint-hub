
import jsPDF from 'jspdf';
import { formatAmount, getCurrencySymbol } from '@/utils/labelFormatters';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

interface Package {
  weight: number | null;
  amount_to_collect?: number | null;
  currency?: string;
}

export class LabelPackageInfoRenderer {
  private pdf: jsPDF;
  private pkg: Package;

  constructor(pdf: jsPDF, pkg: Package) {
    this.pdf = pdf;
    this.pkg = pkg;
  }

  renderWeightAndTotal(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Peso y Total en la misma línea
    this.pdf.setFontSize(10);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFont('helvetica', 'bold');
    
    // Peso (izquierda)
    const pesoText = `Peso: ${this.pkg.weight ? `${this.pkg.weight}kg` : '3kg'}`;
    this.pdf.text(pesoText, startX + 3, currentY);
    
    // Total (derecha)
    const totalAmount = this.pkg.amount_to_collect ? formatAmount(this.pkg.amount_to_collect, this.pkg.currency) : '34.354.435';
    const currencySymbol = getCurrencySymbol(this.pkg.currency);
    const totalText = `Total: ${currencySymbol}${totalAmount}`;
    const totalWidth = this.pdf.getTextWidth(totalText);
    this.pdf.text(totalText, startX + labelWidth - totalWidth - 3, currentY);

    return currentY + SPACING.sectionSpacing;
  }

  renderInfoText(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Texto informativo centrado
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    const infoLines = [
      'Toda encomienda debe ser verificada en el local al',
      'momento de la entrega. Una vez entregada, no se',
      'aceptan reclamos.'
    ];

    infoLines.forEach((line, index) => {
      const infoWidth = this.pdf.getTextWidth(line);
      this.pdf.text(line, startX + (labelWidth - infoWidth) / 2, currentY + (index * SPACING.smallSpacing));
    });

    return currentY + (infoLines.length * SPACING.smallSpacing) + SPACING.sectionSpacing;
  }
}
