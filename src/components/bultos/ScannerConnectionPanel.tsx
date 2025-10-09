import { Card, CardContent } from '@/components/ui/card';
import { Smartphone, Wifi } from 'lucide-react';

interface ScannerConnectionPanelProps {
  qrCodeUrl: string;
  isMobileConnected: boolean;
}

export function ScannerConnectionPanel({ 
  qrCodeUrl, 
  isMobileConnected
}: ScannerConnectionPanelProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <h3 className="font-semibold">
                {isMobileConnected ? 'Escáner Conectado' : 'Escanea para Conectar'}
              </h3>
            </div>

            <div className="space-y-3">
              {!isMobileConnected && (
                <p className="text-sm text-muted-foreground">
                  Escanea este código QR con tu celular
                </p>
              )}
              
              {qrCodeUrl && (
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                </div>
              )}
              
              {isMobileConnected && (
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Wifi className="h-5 w-5" />
                  <span className="font-medium">Listo para escanear códigos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
