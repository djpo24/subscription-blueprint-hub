
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Camera, ArrowLeft, Smartphone, BarChart3 } from 'lucide-react';
import { QRScanner } from './QRScanner';
import { MobileDeliveryForm } from './MobileDeliveryForm';
import type { PackageInDispatch } from '@/types/dispatch';

type ViewMode = 'menu' | 'scanner' | 'delivery';

interface MobileDeliveryViewProps {
  onClose: () => void;
}

export function MobileDeliveryView({ onClose }: MobileDeliveryViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('menu');
  const [scannedPackage, setScannedPackage] = useState<PackageInDispatch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleBarcodeScanned = async (barcodeData: string) => {
    setIsLoading(true);
    try {
      console.log('📊 Código de barras escaneado:', barcodeData);
      
      // El código de barras debería contener el tracking number directamente
      const trackingNumber = barcodeData.trim();
      
      if (trackingNumber) {
        // Aquí normalmente harías una consulta a la API para obtener los datos del paquete
        // Por ahora, simularemos los datos del paquete usando el tracking number
        const mockPackage: PackageInDispatch = {
          id: `package-${trackingNumber}`,
          tracking_number: trackingNumber,
          origin: 'Bogotá',
          destination: 'Aruba',
          status: 'en_destino',
          description: `Paquete escaneado: ${trackingNumber}`,
          weight: 2.5,
          freight: 50000,
          amount_to_collect: 100000,
          currency: 'AWG',
          trip_id: 'trip-123',
          customers: {
            name: `Cliente ${trackingNumber}`,
            email: 'cliente@example.com'
          }
        };
        
        console.log('📦 Paquete simulado creado:', mockPackage);
        setScannedPackage(mockPackage);
        setViewMode('delivery');
      } else {
        throw new Error('Código de barras no válido o vacío');
      }
    } catch (error) {
      console.error('❌ Error procesando código de barras:', error);
      alert('Error: Código de barras no válido o no se pudo procesar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryComplete = () => {
    setScannedPackage(null);
    setViewMode('menu');
  };

  const handleBackToMenu = () => {
    setScannedPackage(null);
    setViewMode('menu');
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
                  onClick={() => setViewMode('scanner')}
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
                  <li>4. Completa la información de entrega</li>
                  <li>5. Confirma la entrega</li>
                </ol>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === 'scanner' && (
          <QRScanner
            onQRCodeScanned={handleBarcodeScanned}
            onCancel={() => setViewMode('menu')}
            isLoading={isLoading}
          />
        )}

        {viewMode === 'delivery' && scannedPackage && (
          <MobileDeliveryForm
            package={scannedPackage}
            onDeliveryComplete={handleDeliveryComplete}
            onCancel={() => setViewMode('menu')}
          />
        )}
      </div>
    </div>
  );
}
