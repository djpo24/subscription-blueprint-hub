import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, Wifi, QrCode } from 'lucide-react';

interface ScannerConnectionPanelProps {
  qrCodeUrl: string;
  isMobileConnected: boolean;
}

export function ScannerConnectionPanel({ 
  qrCodeUrl, 
  isMobileConnected
}: ScannerConnectionPanelProps) {
  const [showQR, setShowQR] = useState(false);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-4">
            {isMobileConnected ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-600">
                    <Wifi className="h-5 w-5" />
                    <span className="font-medium">Escáner Conectado</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQR(!showQR)}
                    className="gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    Conexión
                  </Button>
                </div>

                {showQR && qrCodeUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Escanea este código QR para reconectar otro dispositivo
                    </p>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  <h3 className="font-semibold">Escanea para Conectar</h3>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Escanea este código QR con tu celular
                  </p>
                  
                  {qrCodeUrl && (
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <img src={qrCodeUrl} alt="QR Code" className="w-[200px] h-[200px]" />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
