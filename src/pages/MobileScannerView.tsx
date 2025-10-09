import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { BarcodeScanner } from '@/components/scanner/BarcodeScanner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Smartphone, CheckCircle } from 'lucide-react';

export default function MobileScannerView() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [scannedCount, setScannedCount] = useState(0);

  useEffect(() => {
    const session = searchParams.get('session');
    if (!session) {
      console.error('[MobileScanner] ❌ No session in URL');
      toast.error('Session ID no encontrado en la URL');
      return;
    }
    
    console.log('[MobileScanner] 🚀 Initializing with session:', session);
    setSessionId(session);
    sendHandshake(session);
  }, [searchParams]);

  const sendHandshake = async (session: string) => {
    try {
      console.log('[MobileScanner] 📱 Sending handshake for session:', session);
      
      const { error } = await supabase
        .from('scan_sessions')
        .insert({
          session_id: session,
          barcode: '__connected__',
          processed: true,
          created_by: null // No user required
        });

      if (error) {
        console.error('[MobileScanner] ❌ Handshake error:', error);
        throw error;
      }
      
      console.log('[MobileScanner] ✅ Handshake sent successfully');
      setIsConnected(true);
      toast.success('📱 Conectado al escritorio');
    } catch (error) {
      console.error('[MobileScanner] ❌ Error sending handshake:', error);
      toast.error('Error al conectar con el escritorio');
    }
  };

  const handleScanSuccess = async (barcode: string) => {
    if (!sessionId) {
      console.error('[MobileScanner] ❌ No session');
      toast.error('No hay sesión activa');
      return;
    }

    console.log('[MobileScanner] 📦 Scanned barcode:', barcode);
    console.log('[MobileScanner] 📋 Session ID:', sessionId);

    // Filtrar URLs (QR codes)
    if (barcode.startsWith('http://') || barcode.startsWith('https://')) {
      console.log('[MobileScanner] ⚠️ Ignoring QR code URL');
      toast.info('QR detectado - continúa escaneando productos');
      return;
    }

    try {
      console.log('[MobileScanner] 💾 Inserting scan into database...');
      
      const { data, error } = await supabase
        .from('scan_sessions')
        .insert({
          session_id: sessionId,
          barcode: barcode,
          processed: false,
          created_by: null // No user required
        })
        .select();

      if (error) {
        console.error('[MobileScanner] ❌ Insert error:', error);
        throw error;
      }

      console.log('[MobileScanner] ✅ Scan inserted successfully:', data);
      setScannedCount(prev => prev + 1);
      toast.success(`✓ ${barcode}`);
    } catch (error) {
      console.error('[MobileScanner] ❌ Error saving scan:', error);
      toast.error('Error al guardar escaneo');
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Session ID no encontrado. Por favor escanea el QR nuevamente.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <BarcodeScanner 
          onScanSuccess={handleScanSuccess}
          mode="camera"
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Escáner Móvil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Conectado al escritorio
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Conectando...
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">
                {scannedCount} producto{scannedCount !== 1 ? 's' : ''} escaneado{scannedCount !== 1 ? 's' : ''}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}