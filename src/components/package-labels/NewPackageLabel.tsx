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
  trip_id?: string;
  customers?: {
    name: string;
    email: string;
  };
  trip?: {
    trip_date: string;
  };
  amount_to_collect?: number;
  currency?: 'COP' | 'AWG';
}

interface NewPackageLabelProps {
  package: Package;
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
  isPreview?: boolean;
}

export function NewPackageLabel({ package: pkg, qrCodeDataUrl, barcodeDataUrl, isPreview = false }: NewPackageLabelProps) {
  const scale = isPreview ? 0.6 : 1;
  
  // Formato explícito para la fecha
  let formattedTravelDate = '';
  
  if (pkg.trip && pkg.trip.trip_date) {
    try {
      const tripDate = new Date(pkg.trip.trip_date);
      
      if (!isNaN(tripDate.getTime())) {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        formattedTravelDate = `${monthNames[tripDate.getMonth()]} ${tripDate.getDate()}/${tripDate.getFullYear().toString().slice(2)}`;
        console.log(`✅ Fecha de viaje formateada: ${formattedTravelDate}`);
      } else {
        const fallbackDate = new Date();
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        formattedTravelDate = `${monthNames[fallbackDate.getMonth()]} ${fallbackDate.getDate()}/${fallbackDate.getFullYear().toString().slice(2)}`;
        console.log(`⚠️ Fecha de viaje inválida, usando actual: ${formattedTravelDate}`);
      }
    } catch (e) {
      const fallbackDate = new Date();
      const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      formattedTravelDate = `${monthNames[fallbackDate.getMonth()]} ${fallbackDate.getDate()}/${fallbackDate.getFullYear().toString().slice(2)}`;
      console.log(`❌ Error al procesar fecha de viaje: ${e}`);
    }
  } else {
    const fallbackDate = new Date();
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    formattedTravelDate = `${monthNames[fallbackDate.getMonth()]} ${fallbackDate.getDate()}/${fallbackDate.getFullYear().toString().slice(2)}`;
    console.log(`⚠️ No hay fecha de viaje, usando actual: ${formattedTravelDate}`);
  }

  // Format amount to collect with proper currency symbol
  const formatAmountToCollect = () => {
    if (!pkg.amount_to_collect || pkg.amount_to_collect === 0) {
      return 'Total: $0';
    }
    
    const symbol = pkg.currency === 'AWG' ? 'ƒ' : '$';
    const formattedAmount = pkg.amount_to_collect.toLocaleString('es-CO');
    return `Total: ${symbol}${formattedAmount}`;
  };

  // Format weight
  const formatWeight = () => {
    if (!pkg.weight) {
      return 'Peso: N/A';
    }
    return `Peso: ${pkg.weight}kg`;
  };
  
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
    <div style={baseStyles} data-package-id={pkg.id} data-trip-date={pkg.trip?.trip_date || 'none'}>
      {/* Header - "ENVIOS OJITO" con tracking number a la derecha */}
      <div style={{
        textAlign: 'center',
        padding: '20px 10px 10px 10px',
        borderBottom: '1px solid #eee'
      }}>
        {/* Línea con ENVIOS OJITO y tracking number */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0',
            color: '#333',
            lineHeight: '1.2'
          }}>
            ENVIOS OJITO
          </h1>
          <span style={{
            fontSize: '16px',
            fontWeight: 'normal',
            color: '#666',
            lineHeight: '1.2'
          }}>
            {pkg.tracking_number}
          </span>
        </div>
        
        {/* Nombre del cliente y fecha del viaje en la siguiente línea */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '18px',
          margin: '5px 0',
          color: '#666',
          lineHeight: '1.2'
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
        padding: '10px 30px',
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
        lineHeight: '1.2'
      }}>
        {/* Peso a la izquierda y monto a cobrar a la derecha */}
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
          fontSize: '16px',
          lineHeight: '1.2'
        }}>
          <span style={{ textAlign: 'left' }}>
            {formatWeight()}
          </span>
          <span style={{ 
            textAlign: 'right',
            fontWeight: 'bold'
          }}>
            {formatAmountToCollect()}
          </span>
        </div>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '12px', 
          fontWeight: 'bold',
          fontSize: '13px',
          lineHeight: '1.1'
        }}>
          Toda encomienda debe ser verificada en el local al momento de la entrega. Una vez entregada, no se aceptan reclamos.
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: '1.1', textAlign: 'center' }}>
          Dirección en B/QUILLA: Calle 45B # 22 - 124
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: '1.1', textAlign: 'center' }}>
          Tel: +573127271746
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px', lineHeight: '1.1', textAlign: 'center' }}>
          Dirección Curacao: Jo corsenstraat 48 brievengat
        </div>
        <div style={{ fontSize: '13px', lineHeight: '1.1', textAlign: 'center' }}>
          Tel: +599 9 6964306
        </div>
      </div>
    </div>
  );
}
