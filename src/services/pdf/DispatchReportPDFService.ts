
import jsPDF from 'jspdf';
import type { PackageInDispatch } from '@/types/dispatch';

export class DispatchReportPDFService {
  static generateDispatchReport(packages: PackageInDispatch[]): jsPDF {
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configuración
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const startY = 25;
    let currentY = startY;

    // Título
    pdf.setFontSize(16);
    pdf.setFont(undefined, 'bold');
    pdf.text('Reporte de Despacho', pageWidth / 2, 15, { align: 'center' });

    // Headers de la tabla
    const headers = [
      'Nombre',
      'Teléfono', 
      'Detalles',
      'Flete',
      'Peso',
      'Valor a cobrar',
      'Estado',
      'Método de pago'
    ];

    // Anchos de columnas (ajustados para landscape)
    const colWidths = [35, 25, 60, 20, 15, 25, 20, 25];
    const startX = margin;

    // Dibujar headers
    pdf.setFontSize(10);
    pdf.setFont(undefined, 'bold');
    
    let currentX = startX;
    headers.forEach((header, index) => {
      // Fondo del header
      pdf.setFillColor(230, 230, 230);
      pdf.rect(currentX, currentY - 5, colWidths[index], 8, 'F');
      
      // Borde del header
      pdf.setDrawColor(0, 0, 0);
      pdf.rect(currentX, currentY - 5, colWidths[index], 8);
      
      // Texto del header
      pdf.setTextColor(0, 0, 0);
      pdf.text(header, currentX + 2, currentY, { maxWidth: colWidths[index] - 4 });
      currentX += colWidths[index];
    });

    currentY += 10;

    // Datos de la tabla
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);

    packages.forEach((pkg, rowIndex) => {
      // Verificar si necesitamos una nueva página
      if (currentY > pageHeight - 20) {
        pdf.addPage();
        currentY = 20;
      }

      const customerName = pkg.customers?.name || 'N/A';
      const customerPhone = pkg.customers?.phone || 'N/A';
      const details = pkg.description || 'N/A';
      const freight = pkg.freight ? `$${pkg.freight.toLocaleString('es-CO')}` : '$0';
      const weight = pkg.weight ? `${pkg.weight} kg` : 'N/A';
      const amountToCollect = pkg.amount_to_collect ? `$${pkg.amount_to_collect.toLocaleString('es-CO')}` : '$0';
      const status = ''; // Campo en blanco según requerimiento
      const paymentMethod = ''; // Campo en blanco según requerimiento

      const rowData = [
        customerName,
        customerPhone,
        details,
        freight,
        weight,
        amountToCollect,
        status,
        paymentMethod
      ];

      // Calcular altura de la fila (para texto que se puede envolver)
      const maxLines = Math.max(
        ...rowData.map((text, colIndex) => {
          const lines = pdf.splitTextToSize(text, colWidths[colIndex] - 4);
          return Array.isArray(lines) ? lines.length : 1;
        })
      );
      
      const rowHeight = Math.max(8, maxLines * 3);

      currentX = startX;
      
      // Fondo alternado para las filas
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(248, 248, 248);
        pdf.rect(startX, currentY - 3, pageWidth - (margin * 2), rowHeight, 'F');
      }

      rowData.forEach((cellData, colIndex) => {
        // Borde de la celda
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(currentX, currentY - 3, colWidths[colIndex], rowHeight);
        
        // Texto de la celda (con wrap si es necesario)
        const lines = pdf.splitTextToSize(cellData, colWidths[colIndex] - 4);
        const textLines = Array.isArray(lines) ? lines : [lines];
        
        textLines.forEach((line, lineIndex) => {
          pdf.text(line, currentX + 2, currentY + (lineIndex * 3));
        });
        
        currentX += colWidths[colIndex];
      });

      currentY += rowHeight + 2;
    });

    // Footer con información adicional
    const totalPackages = packages.length;
    const totalWeight = packages.reduce((sum, pkg) => sum + (pkg.weight || 0), 0);
    const totalFreight = packages.reduce((sum, pkg) => sum + (pkg.freight || 0), 0);
    const totalAmountToCollect = packages.reduce((sum, pkg) => sum + (pkg.amount_to_collect || 0), 0);

    currentY += 10;
    pdf.setFont(undefined, 'bold');
    pdf.setFontSize(10);
    
    pdf.text(`Total Encomiendas: ${totalPackages}`, margin, currentY);
    pdf.text(`Peso Total: ${totalWeight} kg`, margin + 60, currentY);
    pdf.text(`Flete Total: $${totalFreight.toLocaleString('es-CO')}`, margin + 120, currentY);
    pdf.text(`Total a Cobrar: $${totalAmountToCollect.toLocaleString('es-CO')}`, margin + 180, currentY);

    // Fecha de generación
    currentY += 10;
    pdf.setFont(undefined, 'normal');
    pdf.setFontSize(8);
    pdf.text(`Generado el: ${new Date().toLocaleString('es-CO')}`, margin, currentY);

    return pdf;
  }

  static async printDispatchReport(packages: PackageInDispatch[]): Promise<void> {
    try {
      console.log('📊 Generando reporte de despacho para', packages.length, 'encomiendas');
      
      const pdf = this.generateDispatchReport(packages);
      
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
      
      console.log('✅ Reporte de despacho generado y abierto para impresión');
    } catch (error) {
      console.error('❌ Error al generar reporte de despacho:', error);
      throw error;
    }
  }
}
