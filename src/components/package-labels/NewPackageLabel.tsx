
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
  
  // Obtenemos la fecha formateada para mostrar en el formato solicitado: "Junio 1/25"
  const travelDate = new Date(pkg.created_at);
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const formattedTravelDate = `${monthNames[travelDate.getMonth()]} ${travelDate.getDate()}/${travelDate.getFullYear().toString().slice(2)}`;
  
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
      {/* Header - Ahora "ENVIOS OJITO" */}
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
          ENVIOS OJITO
        </h1>
        {/* Nombre del cliente y fecha del viaje en la misma línea */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '18px',
          margin: '5px 0',
          color: '#666'
        }}>
          <span style={{ fontWeight: 'normal' }}>
            {pkg.customers?.name || 'CLIENTE'}
          </span>
          <span style={{ 
            fontSize: '16px',
            fontWeight: 'normal'
          }}>
            {formattedTravelDate}
          </span>
        </div>
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
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '12px', 
          fontWeight: 'bold',
          fontSize: '13px' 
        }}>
          Toda encomienda debe ser verificada en el local al momento de la entrega. Una vez entregada, no se aceptan reclamos.
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px' }}>
          Dirección en B/QUILLA: Calle 45B # 22 - 124
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px' }}>
          Tel: +573127271746
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px' }}>
          Dirección Curacao: Jo corsenstraat 48 brievengat
        </div>
        <div style={{ fontSize: '13px' }}>
          Tel: +599 9 6964306
        </div>
      </div>
    </div>
  );
}
