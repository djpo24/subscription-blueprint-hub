
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';
import { LabelHeaderRenderer } from './label-renderers/LabelHeaderRenderer';
import { LabelQRCodeRenderer } from './label-renderers/LabelQRCodeRenderer';
import { LabelPackageInfoRenderer } from './label-renderers/LabelPackageInfoRenderer';
import { LabelAddressRenderer } from './label-renderers/LabelAddressRenderer';
import { LabelBarcodeRenderer } from './label-renderers/LabelBarcodeRenderer';

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
  private headerRenderer: LabelHeaderRenderer;
  private qrCodeRenderer: LabelQRCodeRenderer;
  private packageInfoRenderer: LabelPackageInfoRenderer;
  private addressRenderer: LabelAddressRenderer;
  private barcodeRenderer: LabelBarcodeRenderer;

  constructor(pdf: jsPDF, pkg: Package, labelData: LabelData) {
    this.pdf = pdf;
    this.pkg = pkg;
    this.labelData = labelData;
    
    // Initialize all renderers
    this.headerRenderer = new LabelHeaderRenderer(pdf, pkg);
    this.qrCodeRenderer = new LabelQRCodeRenderer(pdf, labelData);
    this.packageInfoRenderer = new LabelPackageInfoRenderer(pdf, pkg);
    this.addressRenderer = new LabelAddressRenderer(pdf);
    this.barcodeRenderer = new LabelBarcodeRenderer(pdf, pkg, labelData);
  }

  render(): void {
    const { startX, startY, labelWidth, labelHeight } = LABEL_DIMENSIONS;
    
    // Configurar fuente
    this.pdf.setFont('helvetica');
    
    // Dibujar borde principal de la etiqueta
    this.pdf.setLineWidth(0.5);
    this.pdf.setDrawColor(180, 180, 180);
    this.pdf.rect(startX, startY, labelWidth, labelHeight);

    let currentY = startY + 10;

    // Render each section using the dedicated renderers
    currentY = this.headerRenderer.renderHeader(currentY);
    currentY = this.headerRenderer.renderCustomerAndDate(currentY);
    currentY = this.qrCodeRenderer.renderQRCode(currentY);
    currentY = this.packageInfoRenderer.renderWeightAndTotal(currentY);
    currentY = this.packageInfoRenderer.renderInfoText(currentY);
    currentY = this.addressRenderer.renderAddresses(currentY);
    this.barcodeRenderer.renderBarcode(currentY);
  }
}
