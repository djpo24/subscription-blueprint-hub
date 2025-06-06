
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

interface PackageLabelPreviewCardProps {
  package: Package;
  qrCodeDataUrl: string;
  barcodeDataUrl: string;
}

export function PackageLabelPreviewCard({ package: pkg, qrCodeDataUrl, barcodeDataUrl }: PackageLabelPreviewCardProps) {
  return (
    <div className="label-preview border-2 border-gray-300 bg-white" style={{ 
      width: '200px', 
      height: '300px',
      transform: 'scale(0.67)',
      transformOrigin: 'top left'
    }}>
      <div className="h-full flex flex-col border border-black">
        {/* Header superior */}
        <div className="bg-white p-2 border-b border-black">
          <div className="flex justify-between items-start text-xs">
            <div>
              <div className="text-xl font-bold">E</div>
              <div className="font-bold text-xs">ENCOMIENDA</div>
              <div className="text-xs">ZONA: {pkg.origin.substring(0, 1)}</div>
            </div>
            <div className="text-right text-xs">
              <div>#{pkg.tracking_number.substring(0, 12)}</div>
              <div>{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
              <div>DE: {pkg.origin.substring(0, 6)}</div>
            </div>
          </div>
        </div>

        {/* Sección de servicio */}
        <div className="bg-white p-1 border-b border-black">
          <div className="text-xs font-bold text-center">ENCOMIENDA EXPRESS</div>
        </div>

        {/* Información del remitente y destinatario - Más compacta */}
        <div className="bg-white p-2 border-b border-black" style={{ minHeight: '100px' }}>
          <div className="mb-1">
            <div className="text-xs font-bold">DESDE:</div>
            <div className="text-xs">{pkg.origin}</div>
          </div>
          
          <div className="mb-1">
            <div className="text-xs font-bold">PARA:</div>
            <div className="text-sm font-bold">{pkg.customers?.name || 'CLIENTE'}</div>
            <div className="text-xs">{pkg.destination}</div>
          </div>

          <div className="mb-1">
            <div className="text-xs font-bold">DESCRIPCIÓN:</div>
            <div className="text-xs overflow-hidden" style={{ maxHeight: '20px' }}>{pkg.description}</div>
          </div>

          {pkg.weight && (
            <div className="text-xs">
              <span className="font-bold">PESO:</span> {pkg.weight} kg
            </div>
          )}
        </div>

        {/* Código de barras - Más pequeño */}
        <div className="bg-white p-2 border-b border-black" style={{ minHeight: '50px' }}>
          <div className="text-center">
            <div className="text-xs font-bold mb-1">TRACKING #</div>
            {barcodeDataUrl && (
              <img 
                src={barcodeDataUrl} 
                alt="Barcode" 
                className="w-full object-contain"
                style={{ height: '30px' }}
              />
            )}
          </div>
        </div>

        {/* QR Code - MÁS GRANDE */}
        <div className="bg-white p-2 flex-grow flex justify-center items-center">
          {qrCodeDataUrl && (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="mx-auto mb-1 border border-gray-300"
                style={{ width: '80px', height: '80px' }}
              />
              <div className="text-xs font-bold">GESTIÓN DIGITAL</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
