import { useEffect, useState, useRef } from 'react';
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
  const [isProcessing, setIsProcessing] = useState(false);
  const lastScanTimeRef = useRef<number>(0);
  const SCAN_COOLDOWN_MS = 800; // Cooldown entre escaneos

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

    // Verificar cooldown para prevenir escaneos demasiado rápidos
    const now = Date.now();
    const timeSinceLastScan = now - lastScanTimeRef.current;
    if (timeSinceLastScan < SCAN_COOLDOWN_MS) {
      console.log('[MobileScanner] ⏳ Cooldown active, ignoring scan');
      return;
    }

    // Prevenir procesamiento concurrente
    if (isProcessing) {
      console.log('[MobileScanner] ⏳ Already processing, ignoring scan');
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

    setIsProcessing(true);
    lastScanTimeRef.current = now;

    // Función para reintentar el guardado
    const saveWithRetry = async (attempts = 3): Promise<boolean> => {
      for (let i = 0; i < attempts; i++) {
        try {
          console.log(`[MobileScanner] 💾 Attempt ${i + 1}/${attempts} - Inserting scan into database...`);
          
          const { data, error } = await supabase
            .from('scan_sessions')
            .insert({
              session_id: sessionId,
              barcode: barcode,
              processed: false,
              created_by: null
            })
            .select();

          if (error) {
            console.error(`[MobileScanner] ❌ Insert error (attempt ${i + 1}):`, error);
            if (i < attempts - 1) {
              // Esperar antes de reintentar (100ms * intento)
              await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
              continue;
            }
            throw error;
          }

          console.log('[MobileScanner] ✅ Scan inserted successfully:', data);
          return true;
        } catch (error) {
          if (i === attempts - 1) {
            throw error;
          }
        }
      }
      return false;
    };

    try {
      const success = await saveWithRetry();
      if (success) {
        setScannedCount(prev => prev + 1);
        toast.success(`✓ ${barcode}`, { duration: 1500 });
      }
    } catch (error: any) {
      console.error('[MobileScanner] ❌ Error saving scan after retries:', error);
      
      // Mensajes de error más específicos
      let errorMessage = 'Error al guardar escaneo';
      if (error?.message?.includes('JWT')) {
        errorMessage = 'Sesión expirada. Escanea el QR nuevamente';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu red';
      } else if (error?.code === 'PGRST116') {
        errorMessage = 'Error de permisos. Contacta soporte';
      }
      
      toast.error(errorMessage, { duration: 3000 });
    } finally {
      setIsProcessing(false);
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
        
        {isProcessing && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-3">
              <p className="text-sm text-yellow-700 font-medium text-center">
                ⏳ Guardando escaneo...
              </p>
            </CardContent>
          </Card>
        )}

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