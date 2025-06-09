
import jsPDF from 'jspdf';
import { LabelContentRenderer } from './labelContentRenderer';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';

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
    console.log('📄 Iniciando generación de PDF con', packages.length, 'etiquetas');
    
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [LABEL_DIMENSIONS.pageWidth, LABEL_DIMENSIONS.pageHeight]
    });

    let isFirstPage = true;

    for (let i = 0; i < packages.length; i++) {
      const pkg = packages[i];
      const labelData = labelsData.get(pkg.id);
      
      console.log(`📄 Procesando etiqueta ${i + 1}/${packages.length} para paquete ${pkg.id}`);

      if (!labelData) {
        console.error(`❌ No se encontraron datos de etiqueta para el paquete ${pkg.id}`);
        continue;
      }

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Render label content using the renderer
      const renderer = new LabelContentRenderer(pdf, pkg, labelData);
      renderer.render();

      console.log(`✅ Etiqueta ${i + 1} agregada al PDF con código de barras`);
    }

    console.log('📄 PDF generado con', packages.length, 'páginas');
    return pdf;
  }

  static async printPDF(packages: Package[], labelsData: Map<string, LabelData>): Promise<void> {
    try {
      console.log('🖨️ Iniciando impresión de PDF con', packages.length, 'etiquetas');
      
      const pdf = await this.generatePDF(packages, labelsData);
      
      // Abrir el PDF en una nueva ventana para imprimir
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const printWindow = window.open(pdfUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print();
            // Limpiar la URL después de un tiempo
            setTimeout(() => {
              URL.revokeObjectURL(pdfUrl);
            }, 1000);
          }, 500);
        };
      }
      
      console.log('✅ PDF abierto para impresión');
    } catch (error) {
      console.error('❌ Error al generar PDF para impresión:', error);
      throw error;
    }
  }
}
