
import { useRef, useEffect } from 'react';
import { VideoStreamManager } from './videoStreamManager';

export function useCameraStream() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoStreamManagerRef = useRef<VideoStreamManager | null>(null);

  // Initialize the video stream manager
  useEffect(() => {
    videoStreamManagerRef.current = new VideoStreamManager(videoRef, streamRef);
    
    return () => {
      videoStreamManagerRef.current?.cleanup();
    };
  }, []);

  const startVideoStream = async (deviceId: string) => {
    if (!videoStreamManagerRef.current) {
      throw new Error('Video stream manager not initialized');
    }
    return videoStreamManagerRef.current.startVideoStream(deviceId);
  };

  const cleanup = () => {
    videoStreamManagerRef.current?.cleanup();
  };

  return {
    videoRef,
    streamRef,
    startVideoStream,
    cleanup
  };
}
