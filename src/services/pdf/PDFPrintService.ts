
import jsPDF from 'jspdf';

export class PDFPrintService {
  static async printPDF(pdf: jsPDF): Promise<void> {
    console.log('🖨️ Iniciando proceso de impresión de PDF');
    
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
  }
}
