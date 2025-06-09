
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
  currency?: string;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackageLabelPreviewCardProps {
  package: Package;
  qrCodeDataUrl?: string;
  barcodeDataUrl?: string;
  labelData?: LabelData;
}

export function PackageLabelPreviewCard({ 
  package: pkg, 
  qrCodeDataUrl, 
  barcodeDataUrl,
  labelData 
}: PackageLabelPreviewCardProps) {
  const formatAmount = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getCurrencySymbol = (currency?: string) => {
    return currency === 'AWG' ? 'ƒ' : '$';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${day}/${year}`;
  };

  // Usar los datos de labelData si están disponibles, sino usar los props directos
  const qrCode = labelData?.qrCodeDataUrl || qrCodeDataUrl;
  const barcode = labelData?.barcodeDataUrl || barcodeDataUrl;

  return (
    <div style={{ 
      width: '102mm', 
      height: '152mm',
      transform: 'scale(0.4)',
      transformOrigin: 'top left',
      backgroundColor: 'white',
      color: 'black',
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #000',
      padding: '3mm'
    }}>
      {/* Header - ENVIOS OJITO y tracking number */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '5mm',
        paddingBottom: '3mm',
        borderBottom: '1px solid #ddd'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 'bold' }}>ENVIOS OJITO</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: 'bold' }}>{pkg.tracking_number}</div>
        </div>
      </div>

      {/* Segunda línea - Cliente y fecha */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8mm',
        fontSize: '8px',
        color: '#666'
      }}>
        <div>{pkg.customers?.name || 'Cliente'}</div>
        <div>{formatDate(pkg.created_at)}</div>
      </div>

      {/* QR Code centrado con marco */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '8mm'
      }}>
        <div style={{
          backgroundColor: '#f9f9f9',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '3mm',
          display: 'inline-block'
        }}>
          {qrCode && (
            <img 
              src={qrCode} 
              alt="QR Code" 
              style={{ width: '45mm', height: '45mm', display: 'block' }}
            />
          )}
        </div>
      </div>

      {/* Peso y Total en la misma línea */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '8mm',
        fontSize: '10px',
        fontWeight: 'bold'
      }}>
        <div>Peso: {pkg.weight ? `${pkg.weight}kg` : '3kg'}</div>
        <div>
          Total: {getCurrencySymbol(pkg.currency)}{pkg.amount_to_collect ? formatAmount(pkg.amount_to_collect, pkg.currency) : '34.354.435'}
        </div>
      </div>

      {/* Texto informativo centrado */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '9px', 
        fontWeight: 'bold',
        marginBottom: '8mm',
        lineHeight: '1.2'
      }}>
        <div>Toda encomienda debe ser verificada en el local al</div>
        <div>momento de la entrega. Una vez entregada, no se</div>
        <div>aceptan reclamos.</div>
      </div>

      {/* Direcciones centradas */}
      <div style={{ 
        textAlign: 'center', 
        fontSize: '8px',
        marginBottom: '8mm',
        lineHeight: '1.3'
      }}>
        <div style={{ fontWeight: 'bold' }}>Dirección en B/QUILLA: Calle 45B # 22 - 124</div>
        <div style={{ marginBottom: '5mm' }}>Tel: +5731272717446</div>
        
        <div style={{ fontWeight: 'bold' }}>Dirección Curacao: Jo corsenstraat 48 brievengat</div>
        <div>Tel: +599 9 6964306</div>
      </div>

      {/* Línea separadora */}
      <div style={{ 
        borderTop: '1px solid #ccc', 
        margin: '5mm 10mm',
        marginBottom: '5mm'
      }}></div>

      {/* Código de barras centrado */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-end'
      }}>
        {barcode && (
          <>
            <img 
              src={barcode}
              alt="Barcode"
              style={{ width: '70mm', height: '15mm', marginBottom: '2mm' }}
            />
            <div style={{ 
              fontSize: '7px', 
              color: '#666',
              textAlign: 'center'
            }}>
              {pkg.tracking_number}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
