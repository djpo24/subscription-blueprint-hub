import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { format } from 'date-fns';
import { CPCLPrintButton } from './CPCLPrintButton';

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

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="package-label-container">
      {/* Canvas oculto para generar el código de barras */}
      <canvas ref={barcodeCanvasRef} style={{ display: 'none' }} />
      
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-2">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Dimensiones: 10cm x 15cm (aproximadamente)
        </div>
        
        {/* Vista previa escalada de la etiqueta */}
        <div className="label-preview border-2 border-gray-300 bg-white p-3" style={{ 
          width: '200px', 
          height: '300px',
          transform: 'scale(0.67)',
          transformOrigin: 'top left'
        }}>
          <div className="h-full flex flex-col border border-black">
            {/* Header superior estilo USPS */}
            <div className="bg-white p-2 border-b border-black">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <div className="text-2xl font-bold">E</div>
                  <div className="font-bold">ENCOMIENDA</div>
                  <div className="text-xs">ZONA: {pkg.origin.substring(0, 1)}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs">#{pkg.tracking_number.substring(0, 12)}</div>
                  <div className="text-xs">{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
                  <div className="text-xs">DE: {pkg.origin.substring(0, 6)}</div>
                </div>
              </div>
            </div>

            {/* Sección de servicio */}
            <div className="bg-white p-2 border-b border-black">
              <div className="text-sm font-bold">ENCOMIENDA EXPRESS</div>
            </div>

            {/* Información del remitente y destinatario */}
            <div className="bg-white p-2 border-b border-black flex-1">
              <div className="mb-2">
                <div className="text-xs font-bold">DESDE:</div>
                <div className="text-xs">{pkg.origin}</div>
              </div>
              
              <div className="mb-2">
                <div className="text-xs font-bold">PARA:</div>
                <div className="text-sm font-bold">{pkg.customers?.name || 'CLIENTE'}</div>
                <div className="text-xs">{pkg.destination}</div>
              </div>

              <div className="mb-2">
                <div className="text-xs font-bold">DESCRIPCIÓN:</div>
                <div className="text-xs">{pkg.description}</div>
              </div>

              {pkg.weight && (
                <div className="text-xs">
                  <span className="font-bold">PESO:</span> {pkg.weight} kg
                </div>
              )}
            </div>

            {/* Código de barras */}
            <div className="bg-white p-2 border-b border-black">
              <div className="text-center">
                <div className="text-xs font-bold mb-1">TRACKING #</div>
                {barcodeDataUrl && (
                  <img 
                    src={barcodeDataUrl} 
                    alt="Barcode" 
                    className="w-full h-12 object-contain"
                  />
                )}
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-2 flex justify-center items-center">
              {qrCodeDataUrl && (
                <div className="text-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-16 h-16 mx-auto mb-1"
                  />
                  <div className="text-xs">Gestión digital</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Imprimir HTML
          </button>
          
          <CPCLPrintButton package={pkg} />
        </div>
      </div>

      {/* Etiqueta real para impresión */}
      <div className="print-only">
        <div className="label-print" style={{
          width: '10cm',
          height: '15cm',
          backgroundColor: 'white',
          color: 'black',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #000'
        }}>
          {/* Header superior */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderBottom: '2px solid #000',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: '1' }}>E</div>
              <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ENCOMIENDA</div>
              <div style={{ fontSize: '10px' }}>ZONA: {pkg.origin.substring(0, 1)}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '10px' }}>
              <div>#{pkg.tracking_number.substring(0, 12)}</div>
              <div>{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
              <div>DE: {pkg.origin.substring(0, 6)}</div>
            </div>
          </div>

          {/* Sección de servicio */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderBottom: '2px solid #000'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 'bold' }}>ENCOMIENDA EXPRESS</div>
          </div>

          {/* Información del remitente y destinatario */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderBottom: '2px solid #000',
            flexGrow: 1
          }}>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DESDE:</div>
              <div style={{ fontSize: '11px' }}>{pkg.origin}</div>
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>PARA:</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{pkg.customers?.name || 'CLIENTE'}</div>
              <div style={{ fontSize: '11px' }}>{pkg.destination}</div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
              <div style={{ fontSize: '10px' }}>{pkg.description}</div>
            </div>

            {pkg.weight && (
              <div style={{ fontSize: '10px' }}>
                <span style={{ fontWeight: 'bold' }}>PESO:</span> {pkg.weight} kg
              </div>
            )}
          </div>

          {/* Código de barras */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px', 
            borderBottom: '2px solid #000',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>TRACKING #</div>
            {barcodeDataUrl && (
              <img 
                src={barcodeDataUrl} 
                alt="Barcode" 
                style={{ width: '100%', height: '50px', objectFit: 'contain' }}
              />
            )}
          </div>

          {/* QR Code */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '8px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {qrCodeDataUrl && (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  style={{ width: '60px', height: '60px', marginBottom: '4px' }}
                />
                <div style={{ fontSize: '8px' }}>Gestión digital</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: 10cm 15cm;
            margin: 0;
          }
        }
        .package-label-container {
          max-width: 400px;
        }
        .label-preview {
          font-size: 8px;
        }
      `}</style>
    </div>
  );
}
