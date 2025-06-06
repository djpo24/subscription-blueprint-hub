
import { useEffect, useRef, useState, useCallback } from 'react';
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
  
  // Añadir un ID de renderizado para forzar la regeneración
  const renderIdRef = useRef(new Date().getTime());

  // Crear una función para forzar la regeneración
  const regenerateCodes = useCallback(() => {
    console.log('🔄 Forzando REGENERACIÓN de códigos para formato actualizado');
    renderIdRef.current = new Date().getTime();
    setQrCodeDataUrl('');
    setBarcodeDataUrl('');
  }, []);

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        console.log('🚨 Generando QR con FORMATO ACTUALIZADO para paquete:', pkg.id);
        
        // Usar EXACTAMENTE el mismo formato que el QR de prueba para móvil
        const qrData = {
          id: pkg.id,
          tracking: pkg.tracking_number,
          customer: pkg.customers?.name || 'CLIENTE',
          status: pkg.status,
          action: 'package_scan'
        };

        console.log('📱 Datos para QR con formato actualizado:', JSON.stringify(qrData));

        const qrDataString = JSON.stringify(qrData);
        const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        console.log('✅ QR generado con formato ACTUALIZADO, tamaño:', qrCodeUrl.length);
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('❌ Error generando QR con formato actualizado:', error);
      }
    };

    const generateBarcode = () => {
      try {
        console.log('🔄 Generando código de barras para formato actualizado:', pkg.id);
        
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
          console.log('✅ Código de barras generado con formato actualizado');
          setBarcodeDataUrl(barcodeUrl);
        }
      } catch (error) {
        console.error('❌ Error generando código de barras:', error);
      }
    };

    // Generar nuevos códigos siempre para garantizar formato actualizado
    console.log('🧹 Limpiando estados anteriores para forzar regeneración con formato actualizado');
    setQrCodeDataUrl('');
    setBarcodeDataUrl('');
    
    // Pequeño retraso para asegurar que la limpieza se complete
    const timer = setTimeout(() => {
      generateQRCode();
      generateBarcode();
      console.log('🎯 Regeneración con formato actualizado completada, render ID:', renderIdRef.current);
    }, 50);
    
    return () => clearTimeout(timer);
  }, [pkg, renderIdRef.current]);

  return {
    barcodeCanvasRef,
    qrCodeDataUrl,
    barcodeDataUrl,
    regenerateCodes
  };
}
