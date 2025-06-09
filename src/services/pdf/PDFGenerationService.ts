
import jsPDF from 'jspdf';
import { LabelContentRenderer } from '../labelContentRenderer';

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

export class PDFGenerationService {
  static async generateLabels(
    pdf: jsPDF, 
    packages: Package[], 
    labelsData: Map<string, LabelData>
  ): Promise<void> {
    console.log('📄 Iniciando generación de PDF con', packages.length, 'etiquetas');

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
  }
}
