
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Download, AlertCircle } from 'lucide-react';
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
  const [errorMessage, setErrorMessage] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    console.log('🎵 Loading audio:', audioUrl);
    setIsLoading(true);
    setHasError(false);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio loaded successfully');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('❌ Audio loading error:', e);
      setHasError(true);
      setErrorMessage('Error al cargar el audio');
      setIsLoading(false);
      toast({
        title: "Error de audio",
        description: "No se pudo cargar el archivo de audio.",
        variant: "destructive"
      });
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Set source and load
    audio.src = audioUrl;
    audio.load();

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, toast]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setHasError(true);
      setErrorMessage('Error al reproducir el audio');
      toast({
        title: "Error de reproducción",
        description: "No se pudo reproducir el audio.",
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

  const downloadAudio = () => {
    try {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `audio_${Date.now()}.ogg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Descarga iniciada",
        description: "El archivo de audio se está descargando.",
      });
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
        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-red-600 text-sm font-medium">Error al cargar audio</div>
          <div className="text-red-500 text-xs truncate">{errorMessage}</div>
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
      <audio ref={audioRef} preload="metadata" />
      
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
