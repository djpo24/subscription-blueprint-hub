
// Utilidades para generar comandos CPCL para impresora JP-CC450
export interface CPCLLabelData {
  tracking_number: string;
  origin: string;
  destination: string;
  customer_name: string;
  description: string;
  weight?: number;
  created_at: string;
  qr_data: string;
}

export function generateCPCLCommands(data: CPCLLabelData): string {
  const commands = [
    // Inicializar etiqueta - tamaño 10cm x 15cm (aproximadamente 384x576 puntos a 203dpi)
    '! 0 203 203 576 1',
    
    // Texto del header principal
    'TEXT 4 0 10 10 ENCOMIENDA',
    'TEXT 4 0 10 35 EXPRESS',
    
    // Zona y número de tracking
    `TEXT 4 0 280 10 ZONA: ${data.origin.substring(0, 1)}`,
    `TEXT 4 0 200 30 #${data.tracking_number.substring(0, 12)}`,
    `TEXT 4 0 240 50 ${formatDateForLabel(data.created_at)}`,
    
    // Línea divisoria
    'LINE 10 70 370 70 1',
    
    // Información de origen
    'TEXT 4 0 10 80 DESDE:',
    `TEXT 4 0 10 100 ${truncateText(data.origin, 40)}`,
    
    // Información de destino
    'TEXT 4 0 10 130 PARA:',
    `TEXT 7 0 10 150 ${truncateText(data.customer_name, 30)}`,
    `TEXT 4 0 10 180 ${truncateText(data.destination, 40)}`,
    
    // Descripción
    'TEXT 4 0 10 210 DESCRIPCION:',
    `TEXT 4 0 10 230 ${truncateText(data.description, 35)}`,
    
    // Peso si existe
    ...(data.weight ? [`TEXT 4 0 10 260 PESO: ${data.weight} kg`] : []),
    
    // Línea divisoria
    'LINE 10 290 370 290 1',
    
    // Número de tracking para código de barras
    'TEXT 4 0 10 300 TRACKING #',
    
    // Código de barras CODE128
    `BARCODE 128 1 1 50 10 320 ${data.tracking_number}`,
    
    // Línea divisoria
    'LINE 10 390 370 390 1',
    
    // QR Code - posición centrada
    `BARCODE QR 10 400 M 2 U 6`,
    `MA,${data.qr_data}`,
    `ENDQR`,
    
    // Texto para QR
    'TEXT 4 0 100 520 Gestion digital',
    
    // Finalizar e imprimir
    'FORM',
    'PRINT'
  ];
  
  return commands.join('\n');
}

function formatDateForLabel(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit'
  });
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

export function sendToPrinter(cpcl: string): void {
  // Para impresoras que soportan JavaScript printing API
  if ('webkitPrint' in window) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>CPCL Print</title></head>
          <body>
            <pre style="font-family: monospace; white-space: pre-wrap;">${cpcl}</pre>
            <script>
              window.print();
              window.close();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  } else {
    // Fallback: copiar al portapapeles
    navigator.clipboard.writeText(cpcl).then(() => {
      alert('Comandos CPCL copiados al portapapeles. Pégalos en el software de la impresora.');
    });
  }
}
