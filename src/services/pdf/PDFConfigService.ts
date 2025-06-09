
import jsPDF from 'jspdf';
import { LABEL_DIMENSIONS } from '@/utils/labelDimensions';

export class PDFConfigService {
  static createPDF(): jsPDF {
    return new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [LABEL_DIMENSIONS.pageWidth, LABEL_DIMENSIONS.pageHeight]
    });
  }
}
