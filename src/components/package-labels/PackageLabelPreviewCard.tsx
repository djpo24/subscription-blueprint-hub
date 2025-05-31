
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
    <div className="label-preview border-2 border-gray-300 bg-white p-3" style={{ 
      width: '200px', 
      height: '300px',
      transform: 'scale(0.67)',
      transformOrigin: 'top left'
    }}>
      <div className="h-full flex flex-col border border-black">
        {/* Header superior estilo USPS */}
        <div className="bg-white p-2 border-b border-black">
          <div className="flex justify-between items-start text-xs">
            <div>
              <div className="text-2xl font-bold">E</div>
              <div className="font-bold">ENCOMIENDA</div>
              <div className="text-xs">ZONA: {pkg.origin.substring(0, 1)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs">#{pkg.tracking_number.substring(0, 12)}</div>
              <div className="text-xs">{format(new Date(pkg.created_at), 'dd/MM/yy')}</div>
              <div className="text-xs">DE: {pkg.origin.substring(0, 6)}</div>
            </div>
          </div>
        </div>

        {/* Sección de servicio */}
        <div className="bg-white p-2 border-b border-black">
          <div className="text-sm font-bold">ENCOMIENDA EXPRESS</div>
        </div>

        {/* Información del remitente y destinatario */}
        <div className="bg-white p-2 border-b border-black flex-1">
          <div className="mb-2">
            <div className="text-xs font-bold">DESDE:</div>
            <div className="text-xs">{pkg.origin}</div>
          </div>
          
          <div className="mb-2">
            <div className="text-xs font-bold">PARA:</div>
            <div className="text-sm font-bold">{pkg.customers?.name || 'CLIENTE'}</div>
            <div className="text-xs">{pkg.destination}</div>
          </div>

          <div className="mb-2">
            <div className="text-xs font-bold">DESCRIPCIÓN:</div>
            <div className="text-xs">{pkg.description}</div>
          </div>

          {pkg.weight && (
            <div className="text-xs">
              <span className="font-bold">PESO:</span> {pkg.weight} kg
            </div>
          )}
        </div>

        {/* Código de barras */}
        <div className="bg-white p-2 border-b border-black">
          <div className="text-center">
            <div className="text-xs font-bold mb-1">TRACKING #</div>
            {barcodeDataUrl && (
              <img 
                src={barcodeDataUrl} 
                alt="Barcode" 
                className="w-full h-12 object-contain"
              />
            )}
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-2 flex justify-center items-center">
          {qrCodeDataUrl && (
            <div className="text-center">
              <img 
                src={qrCodeDataUrl} 
                alt="QR Code" 
                className="w-16 h-16 mx-auto mb-1"
              />
              <div className="text-xs">Gestión digital</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
