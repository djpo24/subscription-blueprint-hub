import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRScanner } from '@/components/mobile/QRScanner';
import { useScannerConnection } from '@/hooks/useScannerConnection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Scan } from 'lucide-react';
import { toast } from 'sonner';

export default function MobileScanner() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('sessionId') || '';
  const [showScanner, setShowScanner] = useState(false);
  const [connectionError, setConnectionError] = useState<string>('');
  
  const { isConnected, sendScan, startConnection, stopConnection } = useScannerConnection(sessionId, 'mobile');

  useEffect(() => {
    if (sessionId) {
      console.log('[Mobile Scanner] Starting connection with session:', sessionId);
      setConnectionError('');
      try {
        startConnection();
      } catch (error) {
        console.error('[Mobile Scanner] Error starting connection:', error);
        setConnectionError('Error al conectar con el servidor');
      }
    }
    return () => {
      stopConnection();
    };
  }, [sessionId, startConnection, stopConnection]);

  const handleQRCodeScanned = (barcode: string) => {
    console.log('[Mobile Scanner] Scanned:', barcode);
    sendScan(barcode);
    toast.success('Código escaneado', {
      description: barcode
    });
    setShowScanner(false);
    
    // Allow scanning again after 2 seconds
    setTimeout(() => {
      setShowScanner(true);
    }, 2000);
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No se proporcionó un ID de sesión válido</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="h-5 w-5" />
              Escáner Móvil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessionId && (
              <div className="p-2 bg-muted rounded text-xs font-mono text-center">
                Sesión: {sessionId}
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">Estado de Conexión</span>
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <Wifi className="h-5 w-5 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Conectado</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-5 w-5 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Desconectado</span>
                  </>
                )}
              </div>
            </div>

            {connectionError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
                {connectionError}
              </div>
            )}

            {isConnected && (
              <div className="space-y-2">
                {!showScanner ? (
                  <Button 
                    onClick={() => setShowScanner(true)}
                    className="w-full"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    Activar Cámara
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <QRScanner
                      onQRCodeScanned={handleQRCodeScanned}
                      onCancel={() => setShowScanner(false)}
                    />
                  </div>
                )}
              </div>
            )}

            {!isConnected && !connectionError && (
              <div className="text-center text-muted-foreground p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm">Conectando al sistema...</p>
                <p className="text-xs mt-1">
                  Asegúrate de estar en la misma sesión del computador
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
