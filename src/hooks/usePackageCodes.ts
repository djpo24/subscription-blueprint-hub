
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
        console.log('🔄 Generating QR code for package:', pkg.id);
        
        // Use the EXACT SAME format as the QR test image
        const qrData = {
          id: pkg.id,
          tracking: pkg.tracking_number,
          customer: pkg.customers?.name || 'CLIENTE',
          status: pkg.status,
          action: 'package_scan'
        };

        console.log('📱 QR Data structure:', JSON.stringify(qrData));

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
        
        console.log('✅ QR code generated with updated format, size:', qrCodeUrl.length, 'chars');
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('❌ Error generating QR code:', error);
      }
    };

    const generateBarcode = () => {
      try {
        console.log('🔄 Generating barcode for package:', pkg.id);
        
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
          console.log('✅ Barcode generated with updated format, size:', barcodeUrl.length, 'chars');
          setBarcodeDataUrl(barcodeUrl);
        }
      } catch (error) {
        console.error('❌ Error generating barcode:', error);
      }
    };

    // Clear previous states to force regeneration
    setQrCodeDataUrl('');
    setBarcodeDataUrl('');
    
    generateQRCode();
    generateBarcode();
  }, [pkg]);

  return {
    barcodeCanvasRef,
    qrCodeDataUrl,
    barcodeDataUrl
  };
}
