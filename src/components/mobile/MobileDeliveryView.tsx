import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Camera, ArrowLeft, Smartphone, BarChart3 } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { MobileDeliveryForm } from './MobileDeliveryForm';
import { usePackageByTrackingNumber } from '@/hooks/usePackageByTrackingNumber';
import { useScannerSounds } from '@/hooks/qr-scanner/useScannerSounds';
import type { PackageInDispatch } from '@/types/dispatch';

type ViewMode = 'menu' | 'scanner' | 'delivery';

interface MobileDeliveryViewProps {
  onClose: () => void;
}

export function MobileDeliveryView({ onClose }: MobileDeliveryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [scannedTrackingNumber, setScannedTrackingNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Hook para sonidos del escáner
  const { playErrorBeep } = useScannerSounds();

  // Hook para obtener datos del paquete
  const { data: packageData, error: packageError, isLoading: packageLoading } = usePackageByTrackingNumber(scannedTrackingNumber);

  const handleBarcodeScanned = async (barcodeData: string) => {
    console.log('📊 [MobileDeliveryView] Código de barras escaneado:', barcodeData);
    setIsLoading(true);
    
    try {
      // El código de barras debería contener el tracking number directamente
      const trackingNumber = barcodeData.trim();
      
      if (trackingNumber) {
        console.log('🔍 [MobileDeliveryView] Buscando paquete con tracking number:', trackingNumber);
        setScannedTrackingNumber(trackingNumber);
      } else {
        throw new Error('Código de barras no válido o vacío');
      }
    } catch (error) {
      console.error('❌ [MobileDeliveryView] Error procesando código de barras:', error);
      
      // Reproducir sonido de error
      await playErrorBeep();
      
      alert(`Error: ${error instanceof Error ? error.message : 'Código de barras no válido o no se pudo procesar'}`);
      setIsLoading(false);
    }
  };

  // Manejar cuando se obtienen los datos del paquete
  useEffect(() => {
    if (packageData && scannedTrackingNumber) {
      console.log('✅ [MobileDeliveryView] Paquete cargado exitosamente:', packageData);
      setIsLoading(false);
      setViewMode('delivery');
    }
  }, [packageData, scannedTrackingNumber]);

  // Manejar errores al cargar el paquete
  useEffect(() => {
    if (packageError && scannedTrackingNumber) {
      console.error('❌ [MobileDeliveryView] Error cargando paquete:', packageError);
      
      // Reproducir sonido de error
      playErrorBeep();
      
      alert(`Error: No se encontró el paquete con tracking number: ${scannedTrackingNumber}`);
      
      // Reset state completely for new scan
      setScannedTrackingNumber(null);
      setIsLoading(false);
      setViewMode('scanner'); // Stay in scanner mode to try again
    }
  }, [packageError, scannedTrackingNumber, playErrorBeep]);

  const handleDeliveryComplete = () => {
    console.log('🏁 [MobileDeliveryView] Entrega completada, reseteando estado...');
    // Reset all state when delivery is complete
    setScannedTrackingNumber(null);
    setIsLoading(false);
    setViewMode('menu');
  };

  const handleBackToMenu = () => {
    console.log('🔙 [MobileDeliveryView] Regresando al menú, reseteando estado...');
    // Reset all state when going back to menu
    setScannedTrackingNumber(null);
    setIsLoading(false);
    setViewMode('menu');
  };

  const handleStartNewScan = () => {
    console.log('🔄 [MobileDeliveryView] Iniciando nuevo escaneo, reseteando estado...');
    // Reset all state before starting new scan
    setScannedTrackingNumber(null);
    setIsLoading(false);
    setViewMode('scanner');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={viewMode === 'menu' ? onClose : handleBackToMenu}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-blue-600" />
            <h1 className="text-lg font-semibold">Entrega Móvil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {viewMode === 'menu' && (
          <div className="space-y-4">
            {!isMobile && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-700">
                    <Camera className="h-4 w-4" />
                    <span className="text-sm">
                      Esta función está optimizada para dispositivos móviles con cámara
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Entregar Paquete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Escanea el código de barras del paquete para iniciar el proceso de entrega
                </p>
                <Button 
                  onClick={handleStartNewScan}
                  className="w-full"
                  size="lg"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Escanear Código de Barras
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">¿Cómo funciona?</h3>
                <ol className="text-sm text-gray-600 space-y-1">
                  <li>1. Haz clic en "Escanear Código de Barras"</li>
                  <li>2. Permite el acceso a la cámara</li>
                  <li>3. Apunta la cámara al código de barras del paquete</li>
                  <li>4. Escucha el pitido de confirmación</li>
                  <li>5. Completa la información de entrega</li>
                  <li>6. Confirma la entrega</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'scanner' && (
          <QRScanner
            onQRCodeScanned={handleBarcodeScanned}
            onCancel={handleBackToMenu}
            isLoading={isLoading || packageLoading}
          />
        )}

        {viewMode === 'delivery' && packageData && (
          <MobileDeliveryForm
            package={packageData}
            onDeliveryComplete={handleDeliveryComplete}
            onCancel={handleBackToMenu}
          />
        )}
      </div>
    </div>
  );
}
