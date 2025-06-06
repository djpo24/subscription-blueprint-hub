
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

  return (
    <div style={baseStyles}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '20px',
        fontSize: isPrintMode ? '16px' : '14px'
      }}>
        <div>
          <div style={{ fontSize: isPrintMode ? '20px' : '18px', fontWeight: 'bold', marginBottom: '4px' }}>
            ENVIOS OJITO
          </div>
          <div style={{ fontSize: isPrintMode ? '14px' : '12px', color: '#666' }}>
            {pkg.customers?.name || 'Cliente'}
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: isPrintMode ? '14px' : '12px' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
            {pkg.tracking_number}
          </div>
          <div style={{ color: '#666' }}>
            {format(new Date(pkg.created_at), 'MMMM d/yy', { locale: { localize: { month: (month: number) => {
              const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
              return months[month];
            }}}}) || format(new Date(pkg.created_at), 'MMM d/yy')}
          </div>
        </div>
      </div>

      {/* QR Code centrado */}
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '16px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        {labelData?.qrCodeDataUrl && (
          <img 
            src={labelData.qrCodeDataUrl} 
            alt="QR Code" 
            style={{ 
              width: isPrintMode ? '180px' : '150px', 
              height: isPrintMode ? '180px' : '150px'
            }}
          />
        )}
      </div>

      {/* Peso y Total */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '16px',
        fontSize: isPrintMode ? '16px' : '14px'
      }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>Peso: </span>
          {pkg.weight ? `${pkg.weight}kg` : '0kg'}
        </div>
        <div style={{ fontWeight: 'bold', fontSize: isPrintMode ? '18px' : '16px' }}>
          <span>Total: </span>
          <span>₡{pkg.amount_to_collect ? formatCurrency(pkg.amount_to_collect) : '0'}</span>
        </div>
      </div>

      {/* Texto informativo centrado */}
      <div style={{ 
        textAlign: 'center',
        fontSize: isPrintMode ? '12px' : '10px',
        lineHeight: '1.3',
        marginBottom: '16px',
        fontWeight: '500'
      }}>
        <div>Toda encomienda debe ser verificada en el local al</div>
        <div>momento de la entrega. Una vez entregada, no se</div>
        <div>aceptan reclamos.</div>
      </div>

      {/* Direcciones centradas */}
      <div style={{ 
        textAlign: 'center',
        fontSize: isPrintMode ? '11px' : '9px',
        lineHeight: '1.4',
        color: '#333'
      }}>
        <div style={{ marginBottom: '8px' }}>
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
