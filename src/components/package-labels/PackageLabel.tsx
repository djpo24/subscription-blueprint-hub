
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
  // Set dimensions to exactly 10cm x 15cm
  const baseStyles = {
    width: '10cm',
    height: '15cm',
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
    <div style={baseStyles} data-package-id={pkg.id}>
      {/* Header superior */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px', 
        borderBottom: '2px solid #000',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        minHeight: isPrintMode ? '50px' : '40px'
      }}>
        <div>
          <div style={{ fontSize: isPrintMode ? '20px' : '16px', fontWeight: 'bold', lineHeight: '1' }}>E</div>
          <div style={{ fontSize: isPrintMode ? '10px' : '8px', fontWeight: 'bold' }}>ENCOMIENDA</div>
          <div style={{ fontSize: isPrintMode ? '8px' : '6px' }}>ZONA: {pkg.origin.substring(0, 1)}</div>
        </div>
        <div style={{ textAlign: 'right', fontSize: isPrintMode ? '8px' : '6px' }}>
          <div>#{pkg.tracking_number.substring(0, 12)}</div>
          <div>{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
          <div>DE: {pkg.origin.substring(0, 6)}</div>
        </div>
      </div>

      {/* Sección de servicio */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '6px' : '4px', 
        borderBottom: '2px solid #000',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: isPrintMode ? '12px' : '10px', fontWeight: 'bold' }}>ENCOMIENDA EXPRESS</div>
      </div>

      {/* Información del remitente y destinatario - Reducido */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '8px' : '6px', 
        borderBottom: '2px solid #000',
        minHeight: isPrintMode ? '140px' : '120px'
      }}>
        <div style={{ marginBottom: isPrintMode ? '6px' : '4px' }}>
          <div style={{ fontSize: isPrintMode ? '8px' : '6px', fontWeight: 'bold' }}>DESDE:</div>
          <div style={{ fontSize: isPrintMode ? '9px' : '7px', wordWrap: 'break-word' }}>{pkg.origin}</div>
        </div>
        
        <div style={{ marginBottom: isPrintMode ? '6px' : '4px' }}>
          <div style={{ fontSize: isPrintMode ? '8px' : '6px', fontWeight: 'bold' }}>PARA:</div>
          <div style={{ fontSize: isPrintMode ? '11px' : '9px', fontWeight: 'bold', wordWrap: 'break-word' }}>{pkg.customers?.name || 'CLIENTE'}</div>
          <div style={{ fontSize: isPrintMode ? '9px' : '7px', wordWrap: 'break-word' }}>{pkg.destination}</div>
        </div>

        <div style={{ marginBottom: isPrintMode ? '6px' : '4px' }}>
          <div style={{ fontSize: isPrintMode ? '8px' : '6px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
          <div style={{ fontSize: isPrintMode ? '8px' : '6px', wordWrap: 'break-word', maxHeight: isPrintMode ? '30px' : '25px', overflow: 'hidden' }}>{pkg.description}</div>
        </div>

        {pkg.weight && (
          <div style={{ fontSize: isPrintMode ? '8px' : '6px' }}>
            <span style={{ fontWeight: 'bold' }}>PESO:</span> {pkg.weight} kg
          </div>
        )}
      </div>

      {/* Código de barras - Reducido */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '6px' : '4px', 
        borderBottom: '2px solid #000',
        textAlign: 'center',
        minHeight: isPrintMode ? '60px' : '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: isPrintMode ? '8px' : '6px', fontWeight: 'bold', marginBottom: '2px' }}>TRACKING #</div>
        {labelData?.barcodeDataUrl && (
          <img 
            src={labelData.barcodeDataUrl} 
            alt="Barcode" 
            style={{ 
              width: '90%', 
              height: isPrintMode ? '40px' : '35px', 
              objectFit: 'contain',
              margin: '0 auto'
            }}
          />
        )}
      </div>

      {/* QR Code - MÁS GRANDE como en la imagen de ejemplo */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: isPrintMode ? '10px' : '8px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        minHeight: isPrintMode ? '150px' : '130px'
      }}>
        {labelData?.qrCodeDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={labelData.qrCodeDataUrl} 
              alt="QR Code" 
              style={{ 
                width: isPrintMode ? '120px' : '100px', 
                height: isPrintMode ? '120px' : '100px', 
                marginBottom: '4px',
                border: '1px solid #ddd'
              }}
            />
            <div style={{ fontSize: isPrintMode ? '8px' : '6px', fontWeight: 'bold' }}>GESTIÓN DIGITAL</div>
          </div>
        )}
      </div>
    </div>
  );
}
