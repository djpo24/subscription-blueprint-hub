
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

interface PackageLabelPreviewProps {
  package: Package;
  qrCodeDataUrl: string;
  onPrint: () => void;
}

export function PackageLabelPreview({ package: pkg, qrCodeDataUrl, onPrint }: PackageLabelPreviewProps) {
  return (
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
        onClick={onPrint}
        className="mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold flex items-center gap-2 mx-auto"
      >
        <span>🖨️</span>
        Imprimir Etiqueta Premium
      </button>
    </div>
  );
}
