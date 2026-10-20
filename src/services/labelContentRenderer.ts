
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';
import { formatAmount, formatDate, getCurrencySymbol } from '@/utils/labelFormatters';
import {
  LABEL_BRAND,
  LABEL_OFFICES,
  LABEL_TERMS,
  getCityCode,
  getCityName,
  getCurrencyName,
} from '@/utils/labelContent';

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

// Alturas de cada franja de la rejilla (mm). La última franja toma el espacio restante.
const ROWS = {
  header: 10,
  destination: 27,
  recipient: 11,
  details: 12,
  qrAndAmount: 42,
  barcode: 23,
};

const PT_TO_MM = 0.3528;
const CAP_HEIGHT = 0.72; // altura de mayúsculas de Helvetica en em
const capHeight = (pt: number) => pt * PT_TO_MM * CAP_HEIGHT;
const lineHeight = (pt: number) => pt * PT_TO_MM * 1.2;

/**
 * Etiqueta "Rejilla logística": cada dato vive en su celda con una letra de zona.
 * A destino · B destinatario · C fecha · D peso · E guía · F total a cobrar.
 */
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
    const { startX, startY, labelWidth, labelHeight } = LABEL_DIMENSIONS;
    const pdf = this.pdf;

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
    pdf.setDrawColor(0, 0, 0);

    let y = startY;
    y = this.renderHeader(y);
    y = this.renderDestination(y);
    y = this.renderRecipient(y);
    y = this.renderDetails(y);
    y = this.renderQRAndAmount(y);
    y = this.renderBarcode(y);
    this.renderTermsAndOffices(y, startY + labelHeight);

    // Marco exterior encima de todo
    pdf.setLineWidth(0.6);
    pdf.rect(startX, startY, labelWidth, labelHeight);
  }

  private renderHeader(y: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const right = startX + labelWidth - 2.5;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.text(LABEL_BRAND, startX + 2.5, y + (ROWS.header + capHeight(15)) / 2);

    pdf.setFontSize(6);
    pdf.text('ENCOMIENDA', right, y + 2.2 + capHeight(6), { align: 'right' });
    pdf.setFontSize(10);
    pdf.text(this.pkg.tracking_number, right, y + ROWS.header - 2, { align: 'right' });

    return this.rowDivider(y + ROWS.header);
  }

  private renderDestination(y: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const h = ROWS.destination;
    const left = startX + 3;
    const right = startX + labelWidth - 3;

    pdf.setFillColor(0, 0, 0);
    pdf.rect(startX, y, labelWidth, h, 'F');
    pdf.setTextColor(255, 255, 255);

    this.zoneTag(left, y + 2.5, 'A', 'DESTINO', true);

    const codeTop = y + 7;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(56);
    pdf.text(getCityCode(this.pkg.destination), left - 0.6, codeTop + capHeight(56));

    const destName = getCityName(this.pkg.destination);
    if (destName) {
      this.fitText(destName, 60, 9, 6, 'bold');
      pdf.text(destName, left, y + h - 2);
    }

    // Origen a la derecha
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(5.5);
    pdf.text('ORIGEN', right, y + 2.5 + capHeight(5.5), { align: 'right' });
    pdf.setFontSize(20);
    pdf.text(getCityCode(this.pkg.origin), right, y + 6.5 + capHeight(20), { align: 'right' });
    const originName = getCityName(this.pkg.origin);
    if (originName) {
      this.fitText(originName, 30, 7, 5, 'normal');
      pdf.text(originName, right, y + 16.5, { align: 'right' });
    }

    pdf.setTextColor(0, 0, 0);
    return y + h;
  }

  private renderRecipient(y: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const left = startX + 2.5;

    this.zoneTag(left, y + 1.6, 'B', 'DESTINATARIO');
    const name = this.fitText(this.pkg.customers?.name || 'Cliente', labelWidth - 5, 14, 8, 'bold');
    pdf.text(name, left, y + ROWS.recipient - 1.6);

    return this.rowDivider(y + ROWS.recipient);
  }

  private renderDetails(y: number): number {
    const { startX } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const h = ROWS.details;
    const cols = [40, 28, 28];

    const weight = `${this.pkg.weight ? `${this.pkg.weight}kg` : '3kg'}`;
    const match = this.pkg.tracking_number.match(/^[A-Z]+-\d{4}-(\d+)$/);
    const guide = match ? match[1] : this.pkg.tracking_number;

    const cells: Array<[string, string, string]> = [
      ['C', 'FECHA', formatDate(this.pkg.created_at)],
      ['D', 'PESO', weight],
      ['E', 'GUÍA', guide],
    ];

    let x = startX;
    cells.forEach(([letter, label, value], i) => {
      this.zoneTag(x + 2.5, y + 1.6, letter, label);
      const text = this.fitText(value, cols[i] - 5, 12, 6, 'bold');
      pdf.text(text, x + 2.5, y + h - 2);
      x += cols[i];
      if (i < cols.length - 1) this.vDivider(x, y, y + h);
    });

    return this.rowDivider(y + h);
  }

  private renderQRAndAmount(y: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const h = ROWS.qrAndAmount;
    const qrSize = h - 4;
    const cellX = startX + qrSize + 4;
    const cellW = startX + labelWidth - cellX;
    const left = cellX + 2.5;

    try {
      pdf.addImage(this.labelData.qrCodeDataUrl, 'PNG', startX + 2, y + 2, qrSize, qrSize);
    } catch (error) {
      console.error('Error agregando QR code:', error);
    }
    this.vDivider(cellX, y, y + h);

    this.zoneTag(left, y + 2.5, 'F', 'TOTAL A COBRAR');

    const amount = this.pkg.amount_to_collect
      ? formatAmount(this.pkg.amount_to_collect, this.pkg.currency)
      : '34.354.435';
    const total = this.fitText(`${getCurrencySymbol(this.pkg.currency)}${amount}`, cellW - 5, 30, 12, 'bold');
    pdf.text(total, left, y + 8 + capHeight(pdf.getFontSize()));

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.text(getCurrencyName(this.pkg.currency), left, y + 22);

    // Casillas para marcar a mano en la entrega
    const boxY = y + h - 7;
    let boxX = left;
    ['PAGADO', 'VERIFICADO'].forEach(label => {
      pdf.setLineWidth(0.35);
      pdf.rect(boxX, boxY, 3.2, 3.2);
      pdf.text(label, boxX + 4.4, boxY + 1.6 + capHeight(6) / 2);
      boxX += 4.4 + pdf.getTextWidth(label) + 4;
    });

    return this.rowDivider(y + h);
  }

  private renderBarcode(y: number): number {
    const { startX, labelWidth, barcodeWidth, barcodeHeight } = LABEL_DIMENSIONS;
    const pdf = this.pdf;

    try {
      pdf.addImage(
        this.labelData.barcodeDataUrl,
        'PNG',
        startX + (labelWidth - barcodeWidth) / 2,
        y + 2,
        barcodeWidth,
        barcodeHeight
      );
    } catch (error) {
      console.error('Error agregando código de barras:', error);
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.text(this.pkg.tracking_number, startX + labelWidth / 2, y + 2 + barcodeHeight + 3.5, { align: 'center' });

    return this.rowDivider(y + ROWS.barcode);
  }

  private renderTermsAndOffices(y: number, bottom: number): void {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    const pdf = this.pdf;
    const termsW = 46;
    const officesX = startX + termsW;

    // Aviso de reclamos
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.6);
    const termsLines = pdf.splitTextToSize(LABEL_TERMS, termsW - 5) as string[];
    const termsBlock = termsLines.length * lineHeight(6.6);
    pdf.text(termsLines, startX + 2.5, y + (bottom - y - termsBlock) / 2 + capHeight(6.6), {
      lineHeightFactor: 1.2,
    });

    this.vDivider(officesX, y, bottom);

    // Direcciones y teléfonos de las dos sedes
    const fs = 5.8;
    const lh = lineHeight(fs);
    const maxW = labelWidth - termsW - 5;
    const lines: Array<{ text: string; bold: boolean }> = [];
    LABEL_OFFICES.forEach(office => {
      lines.push({ text: `Dirección ${office.city}:`, bold: true });
      (pdf.splitTextToSize(office.address, maxW) as string[]).forEach(text => lines.push({ text, bold: false }));
      lines.push({ text: `Tel: ${office.phone}`, bold: false });
    });

    let ty = y + (bottom - y - lines.length * lh) / 2 + capHeight(fs);
    pdf.setFontSize(fs);
    lines.forEach(line => {
      pdf.setFont('helvetica', line.bold ? 'bold' : 'normal');
      pdf.text(line.text, officesX + 2.5, ty);
      ty += lh;
    });
  }

  // Cuadro negro con la letra de zona + rótulo de la celda
  private zoneTag(x: number, y: number, letter: string, label: string, inverted = false): void {
    const pdf = this.pdf;
    const size = 3.2;
    const fs = 5.5;

    if (inverted) pdf.setFillColor(255, 255, 255);
    else pdf.setFillColor(0, 0, 0);
    pdf.rect(x, y, size, size, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(fs);
    const baseline = y + (size + capHeight(fs)) / 2;
    if (inverted) pdf.setTextColor(0, 0, 0);
    else pdf.setTextColor(255, 255, 255);
    pdf.text(letter, x + size / 2, baseline, { align: 'center' });

    if (inverted) pdf.setTextColor(255, 255, 255);
    else pdf.setTextColor(0, 0, 0);
    pdf.text(label, x + size + 1.2, baseline);
  }

  // Ajusta el tamaño de fuente para que el texto quepa; si ni al mínimo cabe, lo recorta
  private fitText(text: string, maxWidth: number, maxSize: number, minSize: number, style: 'bold' | 'normal'): string {
    const pdf = this.pdf;
    pdf.setFont('helvetica', style);
    let size = maxSize;
    pdf.setFontSize(size);
    while (size > minSize && pdf.getTextWidth(text) > maxWidth) {
      size -= 0.5;
      pdf.setFontSize(size);
    }
    if (pdf.getTextWidth(text) <= maxWidth) return text;
    let cut = text;
    while (cut.length > 1 && pdf.getTextWidth(`${cut}...`) > maxWidth) cut = cut.slice(0, -1);
    return `${cut.trimEnd()}...`;
  }

  private rowDivider(y: number): number {
    const { startX, labelWidth } = LABEL_DIMENSIONS;
    this.pdf.setLineWidth(0.4);
    this.pdf.line(startX, y, startX + labelWidth, y);
    return y;
  }

  private vDivider(x: number, top: number, bottom: number): void {
    this.pdf.setLineWidth(0.4);
    this.pdf.line(x, top, x, bottom);
  }
}
