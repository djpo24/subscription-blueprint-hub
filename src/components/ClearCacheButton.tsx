
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trash2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

export function ClearCacheButton() {
  const [isClearing, setIsClearing] = useState(false);
  const { toast } = useToast();

  const handleClearCache = async () => {
    setIsClearing(true);
    console.log('🗑️ LIMPIANDO CACHÉ: Eliminando todos los datos en caché para forzar consulta API fresca');
    
    try {
      // Eliminar todos los datos de caché para el vuelo AV92
      const { error } = await supabase
        .from('flight_api_cache')
        .delete()
        .eq('flight_number', 'AV92');

      if (error) {
        console.error('❌ Error al limpiar caché:', error);
        throw error;
      }

      console.log('✅ CACHÉ LIMPIADO: Todos los datos en caché para AV92 han sido eliminados');
      console.log('🎯 PRÓXIMA CONSULTA: La siguiente consulta API será completamente fresca y capturará TODOS los datos');
      
      toast({
        title: "Caché Limpiado",
        description: "El caché ha sido eliminado. La próxima consulta API será completamente fresca y capturará todos los datos.",
        variant: "default"
      });
    } catch (error: any) {
      console.error('❌ Error al limpiar caché:', error);
      toast({
        title: "Error al Limpiar Caché",
        description: `No se pudo limpiar el caché: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Button 
      onClick={handleClearCache}
      disabled={isClearing}
      variant="outline"
      className="flex items-center gap-2"
    >
      {isClearing ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isClearing ? 'Limpiando...' : 'Limpiar Caché'}
    </Button>
  );
}
