
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AudioPlayerProps {
  audioUrl: string;
  className?: string;
}

export function AudioPlayer({ audioUrl, className = '' }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    console.log('🎵 Loading audio from URL:', audioUrl);
    setIsLoading(true);
    setHasError(false);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio metadata loaded successfully, duration:', audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      console.log('🎵 Audio playback ended');
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio loading error:', e);
      console.error('❌ Audio error details:', (e.target as HTMLAudioElement)?.error);
      setIsLoading(false);
      setHasError(true);
      toast({
        title: "Error de audio",
        description: "No se pudo cargar el audio. Intenta descargarlo.",
        variant: "destructive"
      });
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio ready to play');
    };

    const handleLoadStart = () => {
      console.log('🔄 Audio load started');
      setIsLoading(true);
    };

    const handleProgress = () => {
      console.log('📊 Audio loading progress');
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('progress', handleProgress);

    // Configure audio element for better compatibility
    audio.preload = 'metadata';
    audio.crossOrigin = 'anonymous';
    
    // Try to load the audio
    try {
      audio.src = audioUrl;
      audio.load();
    } catch (error) {
      console.error('❌ Error setting audio source:', error);
      setHasError(true);
      setIsLoading(false);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('progress', handleProgress);
    };
  }, [audioUrl, toast]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    try {
      if (isPlaying) {
        console.log('⏸️ Pausing audio');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ Playing audio');
        setIsLoading(true);
        
        // Try to play the audio
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
          setIsLoading(false);
          console.log('✅ Audio started playing');
        }
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setIsLoading(false);
      setHasError(true);
      toast({
        title: "Error de reproducción",
        description: "No se pudo reproducir el audio. Intenta descargarlo.",
        variant: "destructive"
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio || hasError || !duration) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const downloadAudio = async () => {
    try {
      console.log('📥 Attempting to download audio from:', audioUrl);
      
      // Create a temporary link to download
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `audio_${Date.now()}.mp3`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo de audio se está descargando.",
      });
      
      console.log('✅ Download initiated successfully');
    } catch (error) {
      console.error('❌ Error downloading audio:', error);
      toast({
        title: "Error de descarga",
        description: "No se pudo descargar el archivo de audio.",
        variant: "destructive"
      });
    }
  };

  const formatTime = (time: number) => {
    if (!isFinite(time) || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className={`flex items-center space-x-3 p-3 border rounded-lg bg-red-50 border-red-200 ${className}`}>
        <div className="text-red-600 text-sm flex-1">
          Error al cargar audio - Intenta descargarlo
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadAudio}
          className="h-8 w-8 p-0 shrink-0"
          title="Descargar audio"
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 p-3 border rounded-lg bg-gray-50 ${className}`}>
      <audio
        ref={audioRef}
        preload="metadata"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={isLoading || hasError}
        className="h-8 w-8 p-0 shrink-0"
        title={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-3 w-3 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-600 whitespace-nowrap">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          disabled={hasError || duration === 0}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #e5e7eb ${progress}%, #e5e7eb 100%)`
          }}
        />
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={downloadAudio}
        className="h-8 w-8 p-0 shrink-0"
        title="Descargar audio"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
