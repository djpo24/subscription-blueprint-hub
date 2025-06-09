
import jsPDF from 'jspdf';
import { formatAmount, getCurrencySymbol, formatDate } from '@/utils/labelFormatters';
import { LABEL_DIMENSIONS, SPACING } from '@/utils/labelDimensions';

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

export class LabelContentRenderer {
  private pdf: jsPDF;
  private pkg: Package;
  private labelData: LabelData;

  constructor(pdf: jsPDF, pkg: Package, labelData: LabelData) {
    this.pdf = pdf;
    this.pkg = pkg;
    this.labelData = labelData;
  }

  render(): void {
    const { pageWidth, pageHeight, labelWidth, labelHeight, startX, startY } = LABEL_DIMENSIONS;
    
    // Configurar fuente
    this.pdf.setFont('helvetica');
    
    // Dibujar borde principal de la etiqueta
    this.pdf.setLineWidth(0.5);
    this.pdf.setDrawColor(180, 180, 180);
    this.pdf.rect(startX, startY, labelWidth, labelHeight);

    let currentY = startY + 10;

    currentY = this.renderHeader(currentY);
    currentY = this.renderCustomerAndDate(currentY);
    currentY = this.renderQRCode(currentY);
    currentY = this.renderWeightAndTotal(currentY);
    currentY = this.renderInfoText(currentY);
    currentY = this.renderAddresses(currentY);
    this.renderBarcode(currentY);
  }

  private renderHeader(currentY: number): number {
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

  private renderCustomerAndDate(currentY: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    
    // Segunda línea - Cliente y fecha con nuevo estilo (color negro y línea más gruesa)
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    
    this.pdf.text(this.pkg.customers?.name || 'Cliente', startX + 3, currentY);

    const dateText = formatDate(this.pkg.created_at);
    const dateWidth = this.pdf.getTextWidth(dateText);
    this.pdf.text(dateText, startX + labelWidth - dateWidth - 3, currentY);

    // Línea negra más gruesa debajo del nombre y fecha
    this.pdf.setLineWidth(3);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.line(startX + 3, currentY + 2, startX + labelWidth - 3, currentY + 2);

    return currentY + SPACING.sectionSpacing;
  }

  private renderQRCode(currentY: number): number {
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

  private renderWeightAndTotal(currentY: number): number {
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

  private renderInfoText(currentY: number): number {
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

  private renderAddresses(currentY: number): number {
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

  private renderBarcode(currentY: number): void {
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
