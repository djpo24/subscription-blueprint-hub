
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface Package {
  id: string;
  tracking_number: string;
  status: string;
  customers?: {
    name: string;
  };
}

interface UseQRCodeResult {
  qrCodeDataUrl: string;
}

export function useQRCode(pkg: Package): UseQRCodeResult {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
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
            dark: '#232F3E',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [pkg]);

  return { qrCodeDataUrl };
}
