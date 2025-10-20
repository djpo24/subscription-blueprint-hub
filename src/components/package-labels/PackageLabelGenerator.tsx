
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
  shortTrackingNumber: string;
}

/**
 * Formats tracking number for barcode by removing the year
 * Example: EO-2025-8388 -> EO-8388
 */
function formatTrackingNumberForBarcode(trackingNumber: string): string {
  // Match pattern like EO-YYYY-XXXX and extract EO-XXXX
  const match = trackingNumber.match(/^([A-Z]+)-\d{4}-(\d+)$/);
  if (match) {
    return `${match[1]}-${match[2]}`;
  }
  // If pattern doesn't match, return original
  return trackingNumber;
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

  // Format tracking number for barcode (remove year)
  const shortTrackingNumber = formatTrackingNumberForBarcode(pkg.tracking_number);
  
  // Generate Barcode with optimized settings for mobile scanning
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, shortTrackingNumber, {
    format: "CODE128",
    width: 3,           // Increased from 2 to 3 for thicker bars
    height: 70,         // Increased from 60 to 70 for better scanning
    displayValue: true,
    fontSize: 14,       // Increased from 12 to 14 for better readability
    margin: 10          // Increased from 0 to 10 for more spacing
  });
  const barcodeUrl = canvas.toDataURL();

  return {
    qrCodeDataUrl: qrCodeUrl,
    barcodeDataUrl: barcodeUrl,
    shortTrackingNumber: shortTrackingNumber
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
