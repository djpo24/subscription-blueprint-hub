
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
  // Generate QR Code
  const qrData = {
    id: pkg.id,
    tracking: pkg.tracking_number,
    customer: pkg.customers?.name || 'N/A',
    status: pkg.status,
    action: 'package_scan'
  };

  const qrDataString = JSON.stringify(qrData);
  const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
    width: 120,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  });

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

  return {
    qrCodeDataUrl: qrCodeUrl,
    barcodeDataUrl: barcodeUrl
  };
}

export async function generateAllLabelsData(packages: Package[]): Promise<Map<string, LabelData>> {
  const labelsData = new Map<string, LabelData>();

  for (const pkg of packages) {
    try {
      const labelData = await generateLabelData(pkg);
      labelsData.set(pkg.id, labelData);
    } catch (error) {
      console.error(`Error generating codes for package ${pkg.id}:`, error);
    }
  }

  return labelsData;
}
