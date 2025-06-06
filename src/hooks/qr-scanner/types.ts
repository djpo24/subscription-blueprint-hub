
export interface CameraDevice {
  deviceId: string;
  label: string;
}

export interface VideoConstraints {
  deviceId: { exact: string };
  facingMode: string;
  width: { ideal: number; min: number; max: number };
  height: { ideal: number; min: number; max: number };
  focusMode: string;
  aspectRatio: { ideal: number };
  frameRate: { ideal: number; min: number; max: number };
  exposureMode: string;
  whiteBalanceMode: string;
  brightness: { ideal: number };
  contrast: { ideal: number };
  saturation: { ideal: number };
}

export interface ScannerState {
  hasPermission: boolean | null;
  error: string | null;
  isScanning: boolean;
  availableCameras: MediaDeviceInfo[];
  currentCameraIndex: number;
}
