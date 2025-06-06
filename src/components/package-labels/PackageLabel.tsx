
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
  console.log('🔄 Rendering PackageLabel with new format for package:', pkg.id);
  console.log('🧩 Label data available:', labelData ? 'Yes' : 'No');
  
  const baseStyles = {
    width: isPrintMode ? 'auto' : '10cm',
    height: isPrintMode ? 'auto' : '15cm',
    maxWidth: isPrintMode ? '6in' : '10cm',
    backgroundColor: 'white',
    color: 'black',
    fontSize: isPrintMode ? '14px' : '12px',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column' as const,
    border: '2px solid #000',
    margin: '0',
    padding: '0',
    boxSizing: 'border-box' as const
  };

  return (
    <div style={baseStyles}>
      {/* Header superior */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px', 
        borderBottom: '2px solid #000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: isPrintMode ? '60px' : '50px'
      }}>
        <div>
          <div style={{ fontSize: isPrintMode ? '24px' : '20px', fontWeight: 'bold', lineHeight: '1' }}>E</div>
          <div style={{ fontSize: isPrintMode ? '12px' : '10px', fontWeight: 'bold' }}>ENCOMIENDA</div>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px' }}>ZONA: {pkg.origin.substring(0, 1)}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: isPrintMode ? '10px' : '8px' }}>
          <div>#{pkg.tracking_number.substring(0, 12)}</div>
          <div>{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
          <div>DE: {pkg.origin.substring(0, 6)}</div>
        </div>
      </div>

      {/* Sección de servicio */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px', 
        borderBottom: '2px solid #000',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: isPrintMode ? '14px' : '12px', fontWeight: 'bold' }}>ENCOMIENDA EXPRESS</div>
      </div>

      {/* Información del remitente y destinatario */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '12px' : '8px', 
        borderBottom: '2px solid #000',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ marginBottom: isPrintMode ? '8px' : '6px' }}>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px', fontWeight: 'bold' }}>DESDE:</div>
          <div style={{ fontSize: isPrintMode ? '11px' : '9px', wordWrap: 'break-word' }}>{pkg.origin}</div>
        </div>
        
        <div style={{ marginBottom: isPrintMode ? '8px' : '6px' }}>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px', fontWeight: 'bold' }}>PARA:</div>
          <div style={{ fontSize: isPrintMode ? '13px' : '11px', fontWeight: 'bold', wordWrap: 'break-word' }}>{pkg.customers?.name || 'CLIENTE'}</div>
          <div style={{ fontSize: isPrintMode ? '11px' : '9px', wordWrap: 'break-word' }}>{pkg.destination}</div>
        </div>

        <div style={{ marginBottom: isPrintMode ? '8px' : '6px' }}>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px', wordWrap: 'break-word', maxHeight: isPrintMode ? '50px' : '40px', overflow: 'hidden' }}>{pkg.description}</div>
        </div>

        {pkg.weight && (
          <div style={{ fontSize: isPrintMode ? '10px' : '8px' }}>
            <span style={{ fontWeight: 'bold' }}>PESO:</span> {pkg.weight} kg
          </div>
        )}
      </div>

      {/* Código de barras */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px', 
        borderBottom: '2px solid #000',
        textAlign: 'center',
        minHeight: isPrintMode ? '80px' : '70px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: isPrintMode ? '10px' : '8px', fontWeight: 'bold', marginBottom: '2px' }}>TRACKING #</div>
        {labelData?.barcodeDataUrl && (
          <img 
            src={labelData.barcodeDataUrl} 
            alt="Barcode" 
            style={{ 
              width: '90%', 
              height: isPrintMode ? '60px' : '50px', 
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        )}
      </div>

      {/* QR Code */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: isPrintMode ? '90px' : '80px'
      }}>
        {labelData?.qrCodeDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={labelData.qrCodeDataUrl} 
              alt="QR Code" 
              style={{ width: isPrintMode ? '60px' : '50px', height: isPrintMode ? '60px' : '50px', marginBottom: '2px' }}
            />
            <div style={{ fontSize: isPrintMode ? '8px' : '6px' }}>Gestión digital</div>
          </div>
        )}
      </div>
    </div>
  );
}
