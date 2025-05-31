
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
          width: '4in',
          height: '6in',
          backgroundColor: 'white',
          color: 'black',
          fontSize: '12px',
          fontFamily: 'Arial, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #000',
          pageBreakAfter: 'always',
          margin: '0 auto',
          padding: '0',
          boxSizing: 'border-box'
        }}
      >
        {/* Header superior */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '6px', 
          borderBottom: '2px solid #000',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          minHeight: '50px'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', lineHeight: '1' }}>E</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>ENCOMIENDA</div>
            <div style={{ fontSize: '8px' }}>ZONA: {pkg.origin.substring(0, 1)}</div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '8px' }}>
            <div>#{pkg.tracking_number.substring(0, 12)}</div>
            <div>{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
            <div>DE: {pkg.origin.substring(0, 6)}</div>
          </div>
        </div>

        {/* Sección de servicio */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '6px', 
          borderBottom: '2px solid #000',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ENCOMIENDA EXPRESS</div>
        </div>

        {/* Información del remitente y destinatario */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '8px', 
          borderBottom: '2px solid #000',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>DESDE:</div>
            <div style={{ fontSize: '9px', wordWrap: 'break-word' }}>{pkg.origin}</div>
          </div>
          
          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>PARA:</div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', wordWrap: 'break-word' }}>{pkg.customers?.name || 'CLIENTE'}</div>
            <div style={{ fontSize: '9px', wordWrap: 'break-word' }}>{pkg.destination}</div>
          </div>

          <div style={{ marginBottom: '6px' }}>
            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
            <div style={{ fontSize: '8px', wordWrap: 'break-word', maxHeight: '40px', overflow: 'hidden' }}>{pkg.description}</div>
          </div>

          {pkg.weight && (
            <div style={{ fontSize: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>PESO:</span> {pkg.weight} kg
            </div>
          )}
        </div>

        {/* Código de barras */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '6px', 
          borderBottom: '2px solid #000',
          textAlign: 'center',
          minHeight: '70px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '2px' }}>TRACKING #</div>
          {labelData?.barcodeDataUrl && (
            <img 
              src={labelData.barcodeDataUrl} 
              alt="Barcode" 
              style={{ 
                width: '90%', 
                height: '50px', 
                objectFit: 'contain',
                margin: '0 auto'
              }}
            />
          )}
        </div>

        {/* QR Code */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '6px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80px'
        }}>
          {labelData?.qrCodeDataUrl && (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={labelData.qrCodeDataUrl} 
                alt="QR Code" 
                style={{ width: '50px', height: '50px', marginBottom: '2px' }}
              />
              <div style={{ fontSize: '6px' }}>Gestión digital</div>
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
          Se imprimirán {packages.length} etiqueta{packages.length !== 1 ? 's' : ''} centradas en páginas separadas
        </div>
        
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {packages.map((pkg) => {
            const labelData = labelsData.get(pkg.id);
            return (
              <div
                key={pkg.id}
                className="border border-gray-300 bg-white p-2 flex justify-center"
                style={{ 
                  width: '150px', 
                  height: '225px'
                }}
              >
                <div style={{ transform: 'scale(0.5)', transformOrigin: 'top center' }}>
                  {renderLabel(pkg, labelData)}
                </div>
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

      {/* CSS para impresión mejorado */}
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
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
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
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          
          .screen-only {
            display: none !important;
          }
          
          @page {
            size: 4in 6in;
            margin: 0.25in;
          }
          
          .label-item {
            margin: 0 auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          
          .label-item:last-child {
            page-break-after: auto;
          }
        }
      `}</style>
    </div>
  );
}
