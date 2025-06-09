
import jsPDF from 'jspdf';
import { PDFConfigService } from './pdf/PDFConfigService';
import { PDFGenerationService } from './pdf/PDFGenerationService';
import { PDFPrintService } from './pdf/PDFPrintService';

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

export class PDFLabelService {
  static async generatePDF(packages: Package[], labelsData: Map<string, LabelData>): Promise<jsPDF> {
    const pdf = PDFConfigService.createPDF();
    await PDFGenerationService.generateLabels(pdf, packages, labelsData);
    return pdf;
  }

  static async printPDF(
    packages: Package[], 
    labelsData: Map<string, LabelData>,
    onPrintSuccess?: (packageIds: string[]) => void
  ): Promise<void> {
    try {
      console.log('🖨️ Iniciando impresión de PDF con', packages.length, 'etiquetas');
      
      const pdf = await this.generatePDF(packages, labelsData);
      await PDFPrintService.printPDF(pdf);
      
      // Llamar al callback de éxito con los IDs de los paquetes
      if (onPrintSuccess) {
        const packageIds = packages.map(pkg => pkg.id);
        console.log('📋 Calling onPrintSuccess with package IDs:', packageIds);
        onPrintSuccess(packageIds);
      }
      
      console.log('✅ PDF print process completed');
    } catch (error) {
      console.error('❌ Error al generar PDF para impresión:', error);
      throw error;
    }
  }
}
