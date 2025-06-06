
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
  console.log('🏷️ Generating FRESH label data for package:', pkg.id);
  console.log('📝 Using updated format consistent with mobile QR test');
  
  // Generate QR Code usando el MISMO formato exacto del QR de prueba móvil
  const qrData = {
    id: pkg.id,
    tracking: pkg.tracking_number,
    customer: pkg.customers?.name || 'CLIENTE',
    status: pkg.status,
    action: 'package_scan'
  };

  console.log('📱 QR Data for package', pkg.id, ':', qrData);

  const qrDataString = JSON.stringify(qrData);
  const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

  console.log('✅ QR Code generated for package', pkg.id, 'Size:', qrCodeUrl.length, 'chars');

  // Generate Barcode
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

  console.log('✅ Barcode generated for package', pkg.id, 'Size:', barcodeUrl.length, 'chars');

  return {
    qrCodeDataUrl: qrCodeUrl,
    barcodeDataUrl: barcodeUrl
  };
}

export async function generateAllLabelsData(packages: Package[]): Promise<Map<string, LabelData>> {
  console.log('🔄 Starting FRESH generation for', packages.length, 'packages');
  const labelsData = new Map<string, LabelData>();

  for (const pkg of packages) {
    try {
      console.log('🏷️ Processing package', pkg.id, '- Tracking:', pkg.tracking_number);
      const labelData = await generateLabelData(pkg);
      labelsData.set(pkg.id, labelData);
      console.log('✅ Label data stored for package', pkg.id);
    } catch (error) {
      console.error(`❌ Error generating codes for package ${pkg.id}:`, error);
    }
  }

  console.log('🎯 FRESH labels generation completed:', labelsData.size, 'labels generated');
  return labelsData;
}
