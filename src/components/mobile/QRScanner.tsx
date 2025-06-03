
import { useQRScanner } from '@/hooks/useQRScanner';
import { CameraPermissionCheck } from './qr-scanner/CameraPermissionCheck';
import { QRScannerVideo } from './qr-scanner/QRScannerVideo';
import { QRScannerControls } from './qr-scanner/QRScannerControls';
import { QRScannerInstructions } from './qr-scanner/QRScannerInstructions';
import { QRScannerError } from './qr-scanner/QRScannerError';

interface QRScannerProps {
  onQRCodeScanned: (qrData: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function QRScanner({ onQRCodeScanned, onCancel, isLoading = false }: QRScannerProps) {
  const {
    hasPermission,
    error,
    isScanning,
    availableCameras,
    currentCameraIndex,
    videoRef,
    switchCamera,
    startScanning,
    stopScanning
  } = useQRScanner();

  const handleStartScanning = () => {
    startScanning(onQRCodeScanned);
  };

  // Show permission check if needed
  if (hasPermission !== true) {
    return <CameraPermissionCheck hasPermission={hasPermission} onCancel={onCancel} />;
  }

  return (
    <div className="space-y-4">
      <QRScannerVideo
        videoRef={videoRef}
        isScanning={isScanning}
        isLoading={isLoading}
        availableCameras={availableCameras}
        currentCameraIndex={currentCameraIndex}
        onStartScanning={handleStartScanning}
        onSwitchCamera={switchCamera}
      />

      {error && <QRScannerError error={error} />}

      <QRScannerControls
        isScanning={isScanning}
        onCancel={onCancel}
        onStopScanning={stopScanning}
      />

      <QRScannerInstructions availableCameras={availableCameras} />
    </div>
  );
}
