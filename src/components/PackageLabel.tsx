
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { format } from 'date-fns';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        // Crear objeto con información del paquete para el QR
        const qrData = {
          id: pkg.id,
          tracking: pkg.tracking_number,
          customer: pkg.customers?.name || 'N/A',
          status: pkg.status,
          action: 'package_scan' // Identificador para la app
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

    generateQRCode();
  }, [pkg]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="package-label-container">
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-2">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-gray-600 mb-4">
          Dimensiones: 10cm x 15cm (aproximadamente)
        </div>
        
        {/* Vista previa escalada de la etiqueta */}
        <div className="label-preview border-2 border-gray-300 bg-white p-4" style={{ 
          width: '200px', 
          height: '300px',
          transform: 'scale(0.67)',
          transformOrigin: 'top left'
        }}>
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="text-center border-b pb-2 mb-3">
              <h2 className="text-lg font-bold">ENCOMIENDA</h2>
              <div className="text-sm font-mono">{pkg.tracking_number}</div>
            </div>

            {/* Customer Info */}
            <div className="mb-3">
              <div className="text-xs font-semibold">CLIENTE:</div>
              <div className="text-sm">{pkg.customers?.name || 'N/A'}</div>
            </div>

            {/* Route */}
            <div className="mb-3">
              <div className="text-xs font-semibold">RUTA:</div>
              <div className="text-sm">{pkg.origin} → {pkg.destination}</div>
            </div>

            {/* Description */}
            <div className="mb-3">
              <div className="text-xs font-semibold">DESCRIPCIÓN:</div>
              <div className="text-xs leading-tight">{pkg.description}</div>
            </div>

            {/* Weight and Date */}
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <div className="font-semibold">PESO:</div>
                <div>{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</div>
              </div>
              <div>
                <div className="font-semibold">FECHA:</div>
                <div>{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-1 flex items-end justify-center">
              {qrCodeDataUrl && (
                <div className="text-center">
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-20 h-20 mx-auto mb-1"
                  />
                  <div className="text-xs">Escanear para gestionar</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir Etiqueta
        </button>
      </div>

      {/* Etiqueta real para impresión (oculta en pantalla) */}
      <div className="print-only">
        <div className="label-print" style={{
          width: '10cm',
          height: '15cm',
          padding: '0.5cm',
          backgroundColor: 'white',
          color: 'black',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #000'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '8px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 4px 0' }}>ENCOMIENDA</h2>
            <div style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 'bold' }}>{pkg.tracking_number}</div>
          </div>

          {/* Customer Info */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>CLIENTE:</div>
            <div style={{ fontSize: '13px', fontWeight: '600' }}>{pkg.customers?.name || 'N/A'}</div>
          </div>

          {/* Route */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>RUTA:</div>
            <div style={{ fontSize: '13px' }}>{pkg.origin} → {pkg.destination}</div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
            <div style={{ fontSize: '11px', lineHeight: '1.3' }}>{pkg.description}</div>
          </div>

          {/* Weight and Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '10px' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>PESO:</div>
              <div>{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontWeight: 'bold' }}>FECHA:</div>
              <div>{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</div>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {qrCodeDataUrl && (
              <div style={{ textAlign: 'center' }}>
                <img 
                  src={qrCodeDataUrl} 
                  alt="QR Code" 
                  style={{ width: '100px', height: '100px', marginBottom: '4px' }}
                />
                <div style={{ fontSize: '9px' }}>Escanear para gestionar</div>
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
          font-size: 10px;
        }
      `}</style>
    </div>
  );
}
