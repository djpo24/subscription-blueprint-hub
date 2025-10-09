import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ScannerConnectionPanelProps {
  sessionId: string;
  isConnected: boolean;
}

export function ScannerConnectionPanel({ 
  sessionId, 
  isConnected
}: ScannerConnectionPanelProps) {
  // Use hash router format for mobile scanner URL
  const mobileUrl = `${window.location.origin}${window.location.pathname}#/mobile-scanner?sessionId=${sessionId}`;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              <h3 className="font-semibold">
                {isConnected ? 'Escáner Conectado' : 'Escanea para Conectar'}
              </h3>
            </div>

            <div className="space-y-3">
              {!isConnected && (
                <p className="text-sm text-muted-foreground">
                  Escanea este código QR con tu celular
                </p>
              )}
              
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <QRCodeSVG value={mobileUrl} size={200} />
              </div>
              
              {isConnected && (
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
