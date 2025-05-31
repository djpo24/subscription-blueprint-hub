
import { format } from 'date-fns';

interface Package {
  tracking_number: string;
  origin: string;
  destination: string;
  description: string;
  weight: number | null;
  created_at: string;
  customers?: {
    name: string;
  };
}

interface PackageLabelPrintProps {
  package: Package;
  qrCodeDataUrl: string;
}

export function PackageLabelPrint({ package: pkg, qrCodeDataUrl }: PackageLabelPrintProps) {
  return (
    <div className="print-only">
      <div className="label-print" style={{
        width: '10cm',
        height: '15cm',
        padding: '0',
        backgroundColor: 'white',
        color: '#1e293b',
        fontSize: '12px',
        fontFamily: '"Amazon Ember", "Helvetica Neue", Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        overflow: 'hidden'
      }}>
        {/* Header Premium */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '16px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '8px',
            marginBottom: '8px'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              backgroundColor: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>📦</div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0' }}>ENCOMIENDA</h2>
          </div>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'inline-block'
          }}>
            <div style={{ fontSize: '16px', fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px' }}>
              {pkg.tracking_number}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: '1', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Customer Info */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '12px',
            borderLeft: '4px solid #3b82f6'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '14px' }}>👤</span>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Cliente
              </div>
            </div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
              {pkg.customers?.name || 'N/A'}
            </div>
          </div>

          {/* Route */}
          <div style={{
            backgroundColor: '#fff7ed',
            borderRadius: '8px',
            padding: '12px',
            borderLeft: '4px solid #fb923c'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginBottom: '6px'
            }}>
              <span style={{ fontSize: '14px' }}>🚚</span>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Ruta
              </div>
            </div>
            <div style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                backgroundColor: '#dcfce7',
                color: '#166534',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>{pkg.origin}</span>
              <span style={{ color: '#94a3b8' }}>→</span>
              <span style={{
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>{pkg.destination}</span>
            </div>
          </div>

          {/* Description */}
          <div style={{
            backgroundColor: '#faf5ff',
            borderRadius: '8px',
            padding: '12px',
            borderLeft: '4px solid #a855f7'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginBottom: '4px'
            }}>
              <span style={{ fontSize: '14px' }}>📋</span>
              <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Contenido
              </div>
            </div>
            <div style={{ fontSize: '11px', lineHeight: '1.4', color: '#374151' }}>
              {pkg.description}
            </div>
          </div>

          {/* Weight and Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div style={{
              backgroundColor: '#f0fdfa',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid #5eead4'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '12px' }}>⚖️</span>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>Peso</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#0f766e' }}>
                {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
              </div>
            </div>
            <div style={{
              backgroundColor: '#eef2ff',
              borderRadius: '8px',
              padding: '10px',
              border: '1px solid #a5b4fc'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                marginBottom: '4px'
              }}>
                <span style={{ fontSize: '12px' }}>📅</span>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: '#64748b' }}>Fecha</div>
              </div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#4338ca' }}>
                {format(new Date(pkg.created_at), 'dd/MM/yyyy')}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Footer */}
        <div style={{ 
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 100%)',
          padding: '16px',
          textAlign: 'center',
          borderTop: '1px solid #e2e8f0'
        }}>
          {qrCodeDataUrl && (
            <div>
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  margin: '0 auto 8px auto',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: 'white',
                  padding: '4px'
                }}
              />
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '500' }}>
                Escanear para gestionar
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
