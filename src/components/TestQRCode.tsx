
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

export function TestQRCode() {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Datos de prueba para el paquete de Didier Ojito
  const testPackageData = {
    id: 'test-package-didier-001',
    tracking: 'ENC-TEST-001',
    customer: 'Didier Ojito',
    status: 'en_destino',
    action: 'package_scan'
  };

  useEffect(() => {
    const generateTestQR = async () => {
      try {
        const qrDataString = JSON.stringify(testPackageData);
        const qrCodeUrl = await QRCode.toDataURL(qrDataString, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        
        setQrCodeDataUrl(qrCodeUrl);
      } catch (error) {
        console.error('Error generating test QR code:', error);
      }
    };

    generateTestQR();
  }, []);

  const copyToClipboard = () => {
    const dataString = JSON.stringify(testPackageData, null, 2);
    navigator.clipboard.writeText(dataString);
    alert('Datos del QR copiados al portapapeles');
  };

  const downloadQR = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = 'test-qr-didier-ojito.png';
      link.href = qrCodeDataUrl;
      link.click();
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Código QR de Prueba</CardTitle>
        <p className="text-sm text-gray-600 text-center">
          Paquete para: <strong>Didier Ojito</strong>
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {qrCodeDataUrl && (
          <div className="flex justify-center">
            <img 
              src={qrCodeDataUrl} 
              alt="QR Code de prueba" 
              className="border border-gray-300 rounded"
            />
          </div>
        )}
        
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Tracking:</strong> {testPackageData.tracking}</p>
          <p><strong>Cliente:</strong> {testPackageData.customer}</p>
          <p><strong>Estado:</strong> {testPackageData.status}</p>
          <p><strong>ID:</strong> {testPackageData.id}</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={copyToClipboard} 
            variant="outline" 
            size="sm" 
            className="flex-1"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copiar Datos
          </Button>
          <Button 
            onClick={downloadQR} 
            variant="outline" 
            size="sm" 
            className="flex-1"
            disabled={!qrCodeDataUrl}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar
          </Button>
        </div>

        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <p><strong>Para probar:</strong></p>
          <ol className="list-decimal list-inside space-y-1 mt-1">
            <li>Abre la vista móvil en tu dispositivo</li>
            <li>Haz clic en "Escanear Código QR"</li>
            <li>Apunta la cámara a este código QR</li>
            <li>El sistema debería reconocer el paquete</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
