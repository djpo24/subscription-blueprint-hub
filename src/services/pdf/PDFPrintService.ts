import jsPDF from 'jspdf';

// El visor de PDF del navegador carga el archivo después del evento load de la
// ventana; si la URL del blob se revoca antes, la pestaña queda en blanco.
const REVOKE_URL_AFTER_MS = 5 * 60 * 1000;

export class PDFPrintService {
  static async printPDF(pdf: jsPDF): Promise<void> {
    console.log('🖨️ Iniciando proceso de impresión de PDF');

    // El propio PDF abre el diálogo de impresión cuando el visor termina de cargarlo
    // (Chrome, Edge y Firefox). Llamar a print() sobre la ventana imprime una página vacía.
    pdf.autoPrint();

    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);

    const printWindow = window.open(pdfUrl, '_blank');
    setTimeout(() => URL.revokeObjectURL(pdfUrl), REVOKE_URL_AFTER_MS);

    if (!printWindow) {
      throw new Error('El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio.');
    }

    console.log('✅ PDF abierto para impresión');
  }
}
