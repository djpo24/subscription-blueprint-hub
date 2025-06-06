
import { MutableRefObject } from 'react';
import { getOptimalVideoConstraints, getFallbackVideoConstraints } from './videoConstraints';

export class VideoStreamManager {
  constructor(
    private videoRef: MutableRefObject<HTMLVideoElement | null>,
    private streamRef: MutableRefObject<MediaStream | null>
  ) {}

  async startVideoStream(deviceId: string): Promise<MediaStream> {
    try {
      console.log('Starting ultra high-resolution video stream for thermal printer Barcode detection with device:', deviceId);
      
      // Stop existing stream
      this.stopCurrentStream();

      // Get optimal constraints for the device
      const videoConstraints = getOptimalVideoConstraints(deviceId);
      
      console.log('Video constraints for thermal printer Barcode:', videoConstraints);

      const constraints = {
        video: videoConstraints,
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.streamRef.current = stream;

      await this.setupVideoElement(stream);
      this.logVideoSettings(stream);
      
      console.log('Ultra high-resolution video stream started for thermal printer Barcode detection');
      return stream;
    } catch (err) {
      console.error('Error starting ultra high-resolution video stream:', err);
      return this.tryFallbackStream(deviceId);
    }
  }

  private stopCurrentStream(): void {
    if (this.streamRef.current) {
      this.streamRef.current.getTracks().forEach(track => track.stop());
      this.streamRef.current = null;
    }
  }

  private async setupVideoElement(stream: MediaStream): Promise<void> {
    if (this.videoRef.current) {
      this.videoRef.current.srcObject = stream;
      
      // Configurar el elemento video para máxima calidad
      this.videoRef.current.setAttribute('playsinline', 'true');
      this.videoRef.current.setAttribute('autoplay', 'true');
      this.videoRef.current.setAttribute('muted', 'true');
      
      await this.videoRef.current.play();
    }
  }

  private logVideoSettings(stream: MediaStream): void {
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    console.log('Actual video settings for thermal printer Barcode:', {
      width: settings.width,
      height: settings.height,
      frameRate: settings.frameRate,
      facingMode: settings.facingMode,
      deviceId: settings.deviceId
    });
  }

  private async tryFallbackStream(deviceId: string): Promise<MediaStream> {
    try {
      console.log('Trying high resolution fallback for thermal printer Barcode...');
      const fallbackConstraints = getFallbackVideoConstraints(deviceId);
      
      const fallbackStream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
      this.streamRef.current = fallbackStream;
      
      if (this.videoRef.current) {
        this.videoRef.current.srcObject = fallbackStream;
        await this.videoRef.current.play();
        console.log('High resolution fallback video stream started');
      }
      
      return fallbackStream;
    } catch (fallbackErr) {
      console.error('High resolution fallback also failed:', fallbackErr);
      throw fallbackErr;
    }
  }

  cleanup(): void {
    console.log('Cleaning up video stream...');
    
    // Stop video stream
    this.stopCurrentStream();

    // Clear video element
    if (this.videoRef.current) {
      this.videoRef.current.srcObject = null;
    }
  }
}
