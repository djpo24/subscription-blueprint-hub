
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  weight: number | null;
  customers?: {
    name: string;
    email: string;
  };
}

export interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export async function generateLabelData(pkg: Package): Promise<LabelData> {
  console.log('🚨 GENERANDO ETIQUETA CON FORMATO ACTUALIZADO para paquete:', pkg.id);
  console.log('📝 Asegurando formato consistente con QR móvil para:', pkg.tracking_number);
  
  // Generar QR Code usando exactamente el mismo formato del QR de prueba móvil
  const qrData = {
    id: pkg.id,
    tracking: pkg.tracking_number,
    customer: pkg.customers?.name || 'CLIENTE',
    status: pkg.status,
    action: 'package_scan'
  };

  console.log('📱 QR Data para formato móvil:', JSON.stringify(qrData));

  const qrDataString = JSON.stringify(qrData);
  const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  console.log('✅ QR Code generado con NUEVO formato para:', pkg.id);

  // Generar código de barras
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, pkg.tracking_number, {
    format: "CODE128",
    width: 2,
    height: 60,
    displayValue: true,
    fontSize: 12,
    margin: 0
  });
  const barcodeUrl = canvas.toDataURL();

  return {
    qrCodeDataUrl: qrCodeUrl,
    barcodeDataUrl: barcodeUrl
  };
}

export async function generateAllLabelsData(packages: Package[]): Promise<Map<string, LabelData>> {
  console.log('🔄 INICIANDO GENERACIÓN CON FORMATO ACTUALIZADO para', packages.length, 'paquetes');
  const labelsData = new Map<string, LabelData>();

  // Borrar cualquier caché anterior para forzar la regeneración con el formato actualizado
  console.log('🗑️ BORRANDO datos en caché para forzar el uso del formato actualizado');

  for (const pkg of packages) {
    try {
      console.log('🏷️ Procesando paquete con formato actualizado:', pkg.id);
      const labelData = await generateLabelData(pkg);
      labelsData.set(pkg.id, labelData);
      console.log('✅ Datos de etiqueta almacenados con NUEVO formato para:', pkg.id);
    } catch (error) {
      console.error(`❌ Error generando códigos para paquete ${pkg.id}:`, error);
    }
  }

  console.log('🎯 Generación de etiquetas con formato actualizado completada:', labelsData.size);
  return labelsData;
}
