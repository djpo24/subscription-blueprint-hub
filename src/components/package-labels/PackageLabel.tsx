
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
  amount_to_collect?: number | null;
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
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount).replace('COP', '').trim();
  };

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
    border: '1px solid #ccc',
    margin: '0',
    padding: '16px',
    boxSizing: 'border-box' as const,
    lineHeight: '1.2'
  };

  // Formatear fecha exactamente como en la imagen
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}/${year}`;
  };

  return (
    <div style={baseStyles}>
      {/* Header - ENVIOS OJITO y tracking number en la misma línea */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '8px',
        fontSize: isPrintMode ? '16px' : '14px'
      }}>
        <div style={{ fontSize: isPrintMode ? '20px' : '18px', fontWeight: 'bold' }}>
          ENVIOS OJITO
        </div>
        <div style={{ fontSize: isPrintMode ? '16px' : '14px', fontWeight: 'bold' }}>
          {pkg.tracking_number}
        </div>
      </div>

      {/* Segunda línea - Cliente y fecha - reducido espacio inferior */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '8px',
        fontSize: isPrintMode ? '14px' : '12px'
      }}>
        <div style={{ color: '#666' }}>
          {pkg.customers?.name || 'Cliente'}
        </div>
        <div style={{ color: '#666' }}>
          {formatDate(pkg.created_at)}
        </div>
      </div>

      {/* QR Code centrado con marco - espacios mínimos arriba y abajo */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '8px',
        padding: '12px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {labelData?.qrCodeDataUrl && (
          <img 
            src={labelData.qrCodeDataUrl} 
            alt="QR Code" 
            style={{ 
              width: isPrintMode ? '180px' : '160px', 
              height: isPrintMode ? '180px' : '160px'
            }}
          />
        )}
      </div>

      {/* Peso y Total en líneas separadas - reducido espacio superior */}
      <div style={{ 
        marginBottom: '12px',
        fontSize: isPrintMode ? '16px' : '14px'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-start',
          marginBottom: '8px'
        }}>
          <span style={{ fontWeight: 'bold' }}>Peso: </span>
          <span>{pkg.weight ? `${pkg.weight}kg` : '3kg'}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end',
          fontSize: isPrintMode ? '18px' : '16px',
          fontWeight: 'bold'
        }}>
          <span>Total: ₡{pkg.amount_to_collect ? formatCurrency(pkg.amount_to_collect) : '34.543.545'}</span>
        </div>
      </div>

      {/* Texto informativo centrado - reducido espacio superior */}
      <div style={{ 
        textAlign: 'center',
        fontSize: isPrintMode ? '11px' : '9px',
        lineHeight: '1.2',
        marginBottom: '12px',
        fontWeight: 'bold'
      }}>
        <div>Toda encomienda debe ser verificada en el local al</div>
        <div>momento de la entrega. Una vez entregada, no se</div>
        <div>aceptan reclamos.</div>
      </div>

      {/* Direcciones centradas */}
      <div style={{ 
        textAlign: 'center',
        fontSize: isPrintMode ? '10px' : '8px',
        lineHeight: '1.3',
        color: '#000'
      }}>
        <div style={{ marginBottom: '6px' }}>
          <div style={{ fontWeight: 'bold' }}>Dirección en B/QUILLA: Calle 45B # 22 - 124</div>
          <div>Tel: +5731272717446</div>
        </div>
        <div>
          <div style={{ fontWeight: 'bold' }}>Dirección Curacao: Jo corsenstraat 48 brievengat</div>
          <div>Tel: +599 9 6964306</div>
        </div>
      </div>
    </div>
  );
}
