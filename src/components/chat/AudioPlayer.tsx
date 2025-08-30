
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [proxiedUrl, setProxiedUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const setupAudio = async () => {
      if (!audioUrl) return;

      console.log('🎵 Setting up audio for URL:', audioUrl);
      setIsLoading(true);
      setHasError(false);

      try {
        // Try to get proxied URL from our server
        console.log('🔄 Requesting proxied audio...');
        const { data, error } = await supabase.functions.invoke('whatsapp-audio-proxy', {
          body: { audioUrl }
        });

        if (error) {
          console.error('❌ Error getting proxied audio:', error);
          throw new Error('Error al obtener audio: ' + error.message);
        }

        if (data && data.error) {
          console.error('❌ Proxy returned error:', data.error);
          throw new Error(data.error);
        }

        // Create blob URL from the response
        const audioBlob = new Blob([data], { type: 'audio/ogg' });
        const blobUrl = URL.createObjectURL(audioBlob);
        setProxiedUrl(blobUrl);
        
        console.log('✅ Audio blob created successfully');

      } catch (error) {
        console.error('❌ Setup audio error:', error);
        setHasError(true);
        toast({
          title: "Error de audio",
          description: "No se pudo cargar el audio. Verifica tu conexión.",
          variant: "destructive"
        });
      }
    };

    setupAudio();

    // Cleanup blob URL when component unmounts
    return () => {
      if (proxiedUrl) {
        URL.revokeObjectURL(proxiedUrl);
      }
    };
  }, [audioUrl, toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !proxiedUrl) return;

    console.log('🎵 Loading proxied audio:', proxiedUrl);

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio metadata loaded, duration:', audio.duration);
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
      console.error('❌ Audio element error:', e);
      setIsLoading(false);
      setHasError(true);
      toast({
        title: "Error de reproducción",
        description: "No se pudo reproducir el audio.",
        variant: "destructive"
      });
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
      console.log('✅ Audio ready to play');
    };

    // Add event listeners
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    // Load the proxied audio
    try {
      audio.src = proxiedUrl;
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
    };
  }, [proxiedUrl, toast]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio || hasError || !proxiedUrl) return;

    try {
      if (isPlaying) {
        console.log('⏸️ Pausing audio');
        audio.pause();
        setIsPlaying(false);
      } else {
        console.log('▶️ Playing audio');
        await audio.play();
        setIsPlaying(true);
        console.log('✅ Audio started playing');
      }
    } catch (error) {
      console.error('❌ Error playing audio:', error);
      setHasError(true);
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

  const downloadAudio = async () => {
    try {
      console.log('📥 Downloading audio...');
      
      if (proxiedUrl) {
        // Use the proxied URL for download
        const link = document.createElement('a');
        link.href = proxiedUrl;
        link.download = `audio_${Date.now()}.ogg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Descarga iniciada",
          description: "El archivo de audio se está descargando.",
        });
      } else {
        throw new Error('Audio no disponible para descarga');
      }
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
      <audio ref={audioRef} preload="metadata" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={isLoading || hasError || !proxiedUrl}
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
          disabled={hasError || duration === 0 || !proxiedUrl}
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
        disabled={!proxiedUrl}
        className="h-8 w-8 p-0 shrink-0"
        title="Descargar audio"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
}
