
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

interface PackageLabelPrintProps {
  package: Package;
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function PackageLabelPrint({ package: pkg, qrCodeDataUrl, barcodeDataUrl }: PackageLabelPrintProps) {
  return (
    <div className="label-print print-container" style={{
      width: '10cm',
      height: '15cm',
      backgroundColor: 'white',
      color: 'black',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid #000',
      boxSizing: 'border-box',
      margin: '0 auto',
      pageBreakAfter: 'always'
    }} data-package-id={pkg.id}>
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
        <div style={{ fontSize: '14px', fontWeight: 'bold', textAlign: 'center' }}>ENCOMIENDA EXPRESS</div>
      </div>

      {/* Información del remitente y destinatario */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        borderBottom: '2px solid #000',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>DESDE:</div>
          <div style={{ fontSize: '11px' }}>{pkg.origin}</div>
        </div>
        
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>PARA:</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{pkg.customers?.name || 'CLIENTE'}</div>
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
        textAlign: 'center',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '4px' }}>TRACKING #</div>
        {barcodeDataUrl && (
          <img 
            src={barcodeDataUrl} 
            alt="Barcode" 
            style={{ width: '100%', height: '60px', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* QR Code */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '90px'
      }}>
        {qrCodeDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code" 
              style={{ width: '75px', height: '75px', marginBottom: '4px' }}
            />
            <div style={{ fontSize: '8px' }}>Gestión digital</div>
          </div>
        )}
      </div>
    </div>
  );
}
