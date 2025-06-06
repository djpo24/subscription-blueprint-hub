
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
  console.log('📝 Using updated format to match mobile QR test exactly');
  
  // Generate QR Code using the EXACT format from the QR test image
  const qrData = {
    id: pkg.id,
    tracking: pkg.tracking_number,
    customer: pkg.customers?.name || 'CLIENTE',
    status: pkg.status,
    action: 'package_scan'
  };

  console.log('📱 QR Data structure for package', pkg.id, ':', JSON.stringify(qrData));

  const qrDataString = JSON.stringify(qrData);
  const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    },
    errorCorrectionLevel: 'H' // Using high error correction for better scanning
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
  console.log('🔄 Starting batch generation for', packages.length, 'packages with updated format');
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

  console.log('🎯 Labels generation completed:', labelsData.size, 'labels generated with updated format');
  return labelsData;
}
