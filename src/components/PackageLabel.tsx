
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
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

interface PackageLabelProps {
  package: Package;
}

export function PackageLabel({ package: pkg }: PackageLabelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = {
          id: pkg.id,
          tracking: pkg.tracking_number,
          customer: pkg.customers?.name || 'N/A',
          status: pkg.status,
          action: 'package_scan'
        };

        const qrDataString = JSON.stringify(qrData);
        const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
          width: 120,
          margin: 1,
          color: {
            dark: '#232F3E',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [pkg]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="package-label-container">
      {/* Contenido visible en pantalla */}
      <div className="mb-4 p-6 border rounded-xl bg-gradient-to-br from-slate-50 to-blue-50 shadow-lg">
        <h3 className="text-xl font-bold mb-3 text-slate-800">Vista Previa de la Etiqueta</h3>
        <div className="text-sm text-slate-600 mb-4 bg-white/60 px-3 py-2 rounded-lg">
          📦 Dimensiones: 10cm x 15cm | Diseño Premium
        </div>
        
        {/* Vista previa escalada de la etiqueta */}
        <div className="label-preview border-2 border-slate-200 bg-white rounded-xl shadow-xl overflow-hidden" style={{ 
          width: '200px', 
          height: '300px',
          transform: 'scale(0.67)',
          transformOrigin: 'top left'
        }}>
          <div className="h-full flex flex-col bg-gradient-to-b from-white to-slate-50">
            {/* Header con gradiente azul Amazon */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs font-bold">📦</span>
                </div>
                <h2 className="text-lg font-bold">ENCOMIENDA</h2>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-1 inline-block">
                <div className="text-sm font-mono font-bold tracking-wider">{pkg.tracking_number}</div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3">
              {/* Customer Info con icono */}
              <div className="bg-slate-50 rounded-lg p-3 border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-blue-600">👤</span>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Cliente</div>
                </div>
                <div className="text-sm font-semibold text-slate-800">{pkg.customers?.name || 'N/A'}</div>
              </div>

              {/* Route con iconos de ubicación */}
              <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-600">🚚</span>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Ruta</div>
                </div>
                <div className="text-xs flex items-center gap-1">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">{pkg.origin}</span>
                  <span className="text-slate-400">→</span>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">{pkg.destination}</span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-purple-600">📋</span>
                  <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Contenido</div>
                </div>
                <div className="text-xs leading-relaxed text-slate-700">{pkg.description}</div>
              </div>

              {/* Weight and Date en grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-teal-50 rounded-lg p-2 border border-teal-200">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-teal-600 text-xs">⚖️</span>
                    <div className="text-xs font-semibold text-slate-600">Peso</div>
                  </div>
                  <div className="text-xs font-bold text-teal-700">{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 border border-indigo-200">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-indigo-600 text-xs">📅</span>
                    <div className="text-xs font-semibold text-slate-600">Fecha</div>
                  </div>
                  <div className="text-xs font-bold text-indigo-700">{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</div>
                </div>
              </div>
            </div>

            {/* QR Code Footer */}
            <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-4 text-center border-t">
              {qrCodeDataUrl && (
                <div>
                  <img 
                    src={qrCodeDataUrl} 
                    alt="QR Code" 
                    className="w-16 h-16 mx-auto mb-2 rounded-lg shadow-md bg-white p-1"
                  />
                  <div className="text-xs text-slate-600 font-medium">Escanear para gestionar</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2 mx-auto"
        >
          <span>🖨️</span>
          Imprimir Etiqueta Premium
        </button>
      </div>

      {/* Etiqueta real para impresión (oculta en pantalla) */}
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

      {/* CSS para impresión mejorado */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
          }
          @page {
            size: 10cm 15cm;
            margin: 0;
          }
        }
        .package-label-container {
          max-width: 500px;
        }
        .label-preview {
          font-size: 10px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}</style>
    </div>
  );
}
