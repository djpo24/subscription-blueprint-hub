
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

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

interface MultiplePackageLabelsProps {
  packages: Package[];
}

interface LabelData {
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function MultiplePackageLabels({ packages }: MultiplePackageLabelsProps) {
  const [labelsData, setLabelsData] = useState<Map<string, LabelData>>(new Map());
  const barcodeRefs = useRef<Map<string, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    const generateLabelsData = async () => {
      const newLabelsData = new Map<string, LabelData>();

      for (const pkg of packages) {
        try {
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

          newLabelsData.set(pkg.id, {
            qrCodeDataUrl: qrCodeUrl,
            barcodeDataUrl: barcodeUrl
          });
        } catch (error) {
          console.error(`Error generating codes for package ${pkg.id}:`, error);
        }
      }

      setLabelsData(newLabelsData);
    };

    generateLabelsData();
  }, [packages]);

  const handlePrint = () => {
    window.print();
  };

  const renderLabel = (pkg: Package, labelData?: LabelData) => {
    return (
      <div 
        key={pkg.id}
        className="label-item"
        style={{
          width: '10cm',
          height: '15cm',
          backgroundColor: 'white',
          color: 'black',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #000',
          pageBreakAfter: 'always',
          margin: '0',
          padding: '0'
        }}
      >
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
          {labelData?.barcodeDataUrl && (
            <img 
              src={labelData.barcodeDataUrl} 
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
          {labelData?.qrCodeDataUrl && (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={labelData.qrCodeDataUrl} 
                alt="QR Code" 
                style={{ width: '60px', height: '60px', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '8px' }}>Gestión digital</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="multiple-labels-container">
      {/* Vista previa en pantalla */}
      <div className="screen-only mb-4 p-4 border rounded-lg bg-white">
        <h3 className="text-lg font-semibold mb-2">Vista Previa - {packages.length} Etiquetas</h3>
        <div className="text-sm text-gray-600 mb-4">
          Se imprimirán {packages.length} etiqueta{packages.length !== 1 ? 's' : ''} en páginas separadas
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {packages.map((pkg) => {
            const labelData = labelsData.get(pkg.id);
            return (
              <div
                key={pkg.id}
                className="border border-gray-300 bg-white p-2"
                style={{ 
                  width: '150px', 
                  height: '225px',
                  transform: 'scale(0.5)',
                  transformOrigin: 'top left'
                }}
              >
                {renderLabel(pkg, labelData)}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handlePrint}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Imprimir {packages.length} Etiqueta{packages.length !== 1 ? 's' : ''}
        </Button>
      </div>

      {/* Etiquetas para impresión */}
      <div className="print-only">
        {packages.map((pkg) => {
          const labelData = labelsData.get(pkg.id);
          return renderLabel(pkg, labelData);
        })}
      </div>

      {/* CSS para impresión */}
      <style>{`
        @media screen {
          .print-only {
            display: none;
          }
          .screen-only {
            display: block;
          }
        }
        
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
          .screen-only {
            display: none !important;
          }
          @page {
            size: 10cm 15cm;
            margin: 0;
          }
          .label-item:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
