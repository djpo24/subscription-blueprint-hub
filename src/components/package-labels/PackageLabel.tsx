
import { format } from 'date-fns';
import { LabelData } from './PackageLabelGenerator';

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
  labelData?: LabelData;
  isPrintMode?: boolean;
}

export function PackageLabel({ package: pkg, labelData, isPrintMode = false }: PackageLabelProps) {
  const baseStyles = {
    width: isPrintMode ? '100%' : '4in',
    height: isPrintMode ? '100%' : '6in',
    backgroundColor: 'white',
    color: 'black',
    fontSize: '12px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    border: isPrintMode ? 'none' : '2px solid #000',
    margin: '0',
    padding: '0',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={baseStyles}>
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
}
