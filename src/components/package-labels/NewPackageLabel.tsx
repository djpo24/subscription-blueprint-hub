
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

interface NewPackageLabelProps {
  package: Package;
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
  isPreview?: boolean;
}

export function NewPackageLabel({ package: pkg, qrCodeDataUrl, barcodeDataUrl, isPreview = false }: NewPackageLabelProps) {
  const scale = isPreview ? 0.6 : 1;
  
  const baseStyles = {
    width: '10cm',
    height: '15cm',
    backgroundColor: 'white',
    color: 'black',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    margin: '0 auto',
    boxSizing: 'border-box' as const,
    transform: isPreview ? `scale(${scale})` : 'none',
    transformOrigin: 'top center',
    border: '1px solid #ddd'
  };

  return (
    <div style={baseStyles} data-package-id={pkg.id}>
      {/* Header - Código QR de Prueba */}
      <div style={{
        textAlign: 'center',
        padding: '20px 10px 10px 10px',
        borderBottom: '1px solid #eee'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          margin: '0 0 5px 0',
          color: '#333'
        }}>
          Código QR de Prueba
        </h1>
        <p style={{
          fontSize: '18px',
          margin: '0',
          color: '#666'
        }}>
          Paquete para: <strong>{pkg.customers?.name || 'CLIENTE'}</strong>
        </p>
      </div>

      {/* QR Code Section - Large and centered like in the example */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '30px',
        flexGrow: 1,
        minHeight: '300px'
      }}>
        {qrCodeDataUrl && (
          <div style={{
            border: '3px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: 'white'
          }}>
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code" 
              style={{
                width: '200px',
                height: '200px',
                display: 'block'
              }}
            />
          </div>
        )}
      </div>

      {/* Package Information */}
      <div style={{
        padding: '15px 20px',
        borderTop: '1px solid #eee',
        fontSize: '16px',
        lineHeight: '1.5'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <strong>Tracking:</strong> {pkg.tracking_number}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Cliente:</strong> {pkg.customers?.name || 'CLIENTE'}
        </div>
        <div style={{ marginBottom: '8px' }}>
          <strong>Estado:</strong> {pkg.status}
        </div>
        <div>
          <strong>ID:</strong> {pkg.id}
        </div>
      </div>
    </div>
  );
}
