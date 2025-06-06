
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

      {/* Información del remitente y destinatario - Compacta */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '8px', 
        borderBottom: '2px solid #000',
        minHeight: '140px'
      }}>
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>DESDE:</div>
          <div style={{ fontSize: '9px' }}>{pkg.origin}</div>
        </div>
        
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>PARA:</div>
          <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{pkg.customers?.name || 'CLIENTE'}</div>
          <div style={{ fontSize: '9px' }}>{pkg.destination}</div>
        </div>

        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>DESCRIPCIÓN:</div>
          <div style={{ fontSize: '8px', maxHeight: '30px', overflow: 'hidden' }}>{pkg.description}</div>
        </div>

        {pkg.weight && (
          <div style={{ fontSize: '8px' }}>
            <span style={{ fontWeight: 'bold' }}>PESO:</span> {pkg.weight} kg
          </div>
        )}
      </div>

      {/* Código de barras - Compacto */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '6px', 
        borderBottom: '2px solid #000',
        textAlign: 'center',
        minHeight: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '2px' }}>TRACKING #</div>
        {barcodeDataUrl && (
          <img 
            src={barcodeDataUrl} 
            alt="Barcode" 
            style={{ width: '100%', height: '40px', objectFit: 'contain' }}
          />
        )}
      </div>

      {/* QR Code - MÁS GRANDE como en la imagen de ejemplo */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexGrow: 1,
        minHeight: '150px'
      }}>
        {qrCodeDataUrl && (
          <div style={{ textAlign: 'center' }}>
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code" 
              style={{ 
                width: '120px', 
                height: '120px', 
                marginBottom: '4px',
                border: '1px solid #ddd'
              }}
            />
            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>GESTIÓN DIGITAL</div>
          </div>
        )}
      </div>
    </div>
  );
}
