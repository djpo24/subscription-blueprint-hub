
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrackingResult {
  tracking_number: string;
  status: string;
  weight: number | null;
  origin: string;
  destination: string;
  last_updated: string;
}

export function useGuestTracking() {
  const [loading, setLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(null);
  const { toast } = useToast();

  const trackPackage = async (trackingNumber: string) => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de rastreo",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTrackingResult(null);

    try {
      // Get client IP (simplified - in production you'd want a more robust solution)
      const clientIP = '127.0.0.1'; // Placeholder - in production use a service to get real IP
      
      // Check rate limiting
      const { data: canQuery, error: limitError } = await supabase
        .rpc('check_guest_query_limit', { p_ip_address: clientIP });

      if (limitError) {
        console.error('Rate limit check error:', limitError);
        toast({
          title: "Error",
          description: "Error verificando límites de consulta",
          variant: "destructive"
        });
        return;
      }

      if (!canQuery) {
        toast({
          title: "Límite excedido",
          description: "Has excedido el límite de consultas diarias. Intenta mañana.",
          variant: "destructive"
        });
        return;
      }

      // Get tracking information
      const { data: trackingData, error: trackingError } = await supabase
        .rpc('get_package_tracking_for_guest', { p_tracking_number: trackingNumber });

      if (trackingError) {
        console.error('Tracking error:', trackingError);
        toast({
          title: "Error",
          description: "Error consultando información de rastreo",
          variant: "destructive"
        });
        return;
      }

      if (!trackingData || trackingData.length === 0) {
        toast({
          title: "No encontrado",
          description: `No se encontró información para el número de rastreo: ${trackingNumber}`,
          variant: "destructive"
        });
        return;
      }

      // Log the query
      await supabase.rpc('log_guest_tracking_query', {
        p_ip_address: clientIP,
        p_tracking_number: trackingNumber,
        p_user_agent: navigator.userAgent
      });

      setTrackingResult(trackingData[0]);
      
      toast({
        title: "Éxito",
        description: "Información de rastreo encontrada",
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado consultando el rastreo",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setTrackingResult(null);
  };

  return {
    trackPackage,
    clearResult,
    loading,
    trackingResult
  };
}
