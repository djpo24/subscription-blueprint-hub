import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Wifi, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ScannerConnectionPanelProps {
  sessionId: string;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function ScannerConnectionPanel({ 
  sessionId, 
  isConnected, 
  onConnect, 
  onDisconnect 
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
              <h3 className="font-semibold">Conexión del Escáner</h3>
            </div>

            {!isConnected ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Escanea este código QR con tu celular para conectar el escáner
                </p>
                <div className="flex justify-center p-4 bg-white rounded-lg">
                  <QRCodeSVG value={mobileUrl} size={150} />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Sesión: {sessionId}
                </p>
                <Button onClick={onConnect} className="w-full">
                  <Wifi className="h-4 w-4 mr-2" />
                  Activar Escáner
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Wifi className="h-5 w-5" />
                  <span className="font-medium">Escáner conectado</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ahora puedes escanear códigos de barras con tu celular
                </p>
                <Button onClick={onDisconnect} variant="outline" className="w-full">
                  <WifiOff className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
