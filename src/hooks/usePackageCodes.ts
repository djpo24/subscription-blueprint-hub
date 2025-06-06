
import { useEffect, useRef, useState } from 'react';
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

export function usePackageCodes(pkg: Package) {
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>('');

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
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    const generateBarcode = () => {
      try {
        if (barcodeCanvasRef.current) {
          JsBarcode(barcodeCanvasRef.current, pkg.tracking_number, {
            format: "CODE128",
            width: 2,
            height: 60,
            displayValue: true,
            fontSize: 12,
            margin: 0
          });
          
          const barcodeUrl = barcodeCanvasRef.current.toDataURL();
          setBarcodeDataUrl(barcodeUrl);
        }
      } catch (error) {
        console.error('Error generating barcode:', error);
      }
    };

    generateQRCode();
    generateBarcode();
  }, [pkg]);

  return {
    barcodeCanvasRef,
    qrCodeDataUrl,
    barcodeDataUrl
  };
}
