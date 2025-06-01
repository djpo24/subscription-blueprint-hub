
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plane, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function AutoFlightDataRefresh() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAutoRefresh = async () => {
    setIsProcessing(true);
    console.log('🎯 INICIANDO PROCESO AUTOMÁTICO COMPLETO:');
    console.log('1️⃣ PASO 1: Limpiando caché para forzar consulta API fresca');
    
    try {
      // PASO 1: Limpiar caché
      const { error: clearError } = await supabase
        .from('flight_api_cache')
        .delete()
        .eq('flight_number', 'AV92');

      if (clearError) {
        console.error('❌ Error limpiando caché:', clearError);
        throw clearError;
      }

      console.log('✅ PASO 1 COMPLETADO: Caché limpiado exitosamente');
      console.log('2️⃣ PASO 2: Ejecutando consulta API fresca para capturar TODOS los datos');
      
      // PASO 2: Ejecutar monitoreo manual que hará consulta API fresca
      const response = await supabase.functions.invoke('flight-monitor');
      
      if (response.error) {
        console.error('❌ Error en consulta API:', response.error);
        throw response.error;
      }

      console.log('✅ PASO 2 COMPLETADO: Consulta API ejecutada exitosamente');
      console.log('📊 RESULTADO FINAL:', response.data);
      
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      const message = response.data?.updated > 0 
        ? `¡Proceso completado! Se capturaron ${response.data.updated} vuelos con datos COMPLETOS de la API incluyendo nombres reales de aeropuertos.`
        : 'Proceso completado. Los datos del vuelo han sido actualizados con información fresca de la API.';
      
      toast({
        title: "Datos Actualizados Completamente",
        description: message,
        variant: "default"
      });

      console.log('🎉 PROCESO AUTOMÁTICO COMPLETADO EXITOSAMENTE');
      console.log('✅ Ahora el vuelo AV92 debe mostrar los nombres REALES de aeropuertos de la API');
      
    } catch (error: any) {
      console.error('💥 Error en proceso automático:', error);
      toast({
        title: "Error en Actualización",
        description: `No se pudo completar la actualización: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Plane className="h-5 w-5 text-blue-600" />
        Actualización Automática de Datos de Vuelo
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Ejecuta el proceso completo para obtener los datos más actualizados del vuelo AV92 
          con nombres reales de aeropuertos directamente de la API de AviationStack.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Proceso automático:</h4>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>Limpia completamente el caché del vuelo AV92</li>
            <li>Ejecuta consulta fresca a la API de AviationStack</li>
            <li>Captura TODOS los datos completos incluyendo nombres reales de aeropuertos</li>
            <li>Actualiza la base de datos con la información completa</li>
            <li>Refresca la interfaz para mostrar los datos actualizados</li>
          </ol>
        </div>
        
        <Button 
          onClick={handleAutoRefresh}
          disabled={isProcessing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Procesando... (Limpiando caché y consultando API)
            </>
          ) : (
            <>
              <Plane className="h-5 w-5" />
              Actualizar Datos Completos del Vuelo AV92
            </>
          )}
        </Button>
        
        {isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Ejecutando proceso automático... Por favor espera mientras se obtienen los datos frescos de la API.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
