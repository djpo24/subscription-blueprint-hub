
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
    console.log('🎯 INICIANDO PROCESO COMPLETO DE RESETEO Y CONSULTA FRESCA:');
    console.log('1️⃣ PASO 1: ELIMINANDO COMPLETAMENTE todos los datos del vuelo AV92');
    
    try {
      // PASO 1: Eliminar COMPLETAMENTE el registro del vuelo AV92 de flight_data
      const { error: deleteFlightError } = await supabase
        .from('flight_data')
        .delete()
        .eq('flight_number', 'AV92');

      if (deleteFlightError) {
        console.error('❌ Error eliminando datos del vuelo:', deleteFlightError);
        throw deleteFlightError;
      }

      console.log('✅ PASO 1 COMPLETADO: Registro del vuelo AV92 eliminado completamente');
      console.log('2️⃣ PASO 2: Limpiando caché API para forzar consulta fresca');
      
      // PASO 2: Limpiar caché API
      const { error: clearCacheError } = await supabase
        .from('flight_api_cache')
        .delete()
        .eq('flight_number', 'AV92');

      if (clearCacheError) {
        console.error('❌ Error limpiando caché:', clearCacheError);
        throw clearCacheError;
      }

      console.log('✅ PASO 2 COMPLETADO: Caché API limpiado exitosamente');
      console.log('3️⃣ PASO 3: Ejecutando consulta API COMPLETAMENTE FRESCA');
      
      // PASO 3: Ejecutar monitoreo manual que creará un nuevo registro con datos frescos
      const response = await supabase.functions.invoke('flight-monitor');
      
      if (response.error) {
        console.error('❌ Error en consulta API:', response.error);
        throw response.error;
      }

      console.log('✅ PASO 3 COMPLETADO: Consulta API ejecutada exitosamente');
      console.log('📊 RESULTADO FINAL:', response.data);
      
      // PASO 4: Esperar un momento y verificar que los datos se guardaron correctamente
      setTimeout(async () => {
        const { data: newFlightData } = await supabase
          .from('flight_data')
          .select('*')
          .eq('flight_number', 'AV92')
          .single();
        
        console.log('🔍 VERIFICACIÓN: Datos del vuelo después del proceso completo:', {
          flight_number: newFlightData?.flight_number,
          api_departure_airport: newFlightData?.api_departure_airport,
          api_arrival_airport: newFlightData?.api_arrival_airport,
          api_departure_city: newFlightData?.api_departure_city,
          api_arrival_city: newFlightData?.api_arrival_city,
          has_api_data: !!(newFlightData?.api_departure_airport || newFlightData?.api_arrival_airport)
        });
      }, 2000);
      
      // Invalidar queries para actualizar la UI
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      const message = response.data?.updated > 0 
        ? `¡Proceso COMPLETO realizado! Se eliminó el registro anterior y se creó uno nuevo con ${response.data.updated} vuelos con datos COMPLETOS de la API incluyendo nombres reales de aeropuertos.`
        : 'Proceso COMPLETO realizado. Se eliminó el registro anterior y se creó uno nuevo con información fresca de la API.';
      
      toast({
        title: "Reseteo Completo y Datos Actualizados",
        description: message,
        variant: "default"
      });

      console.log('🎉 PROCESO COMPLETO DE RESETEO Y ACTUALIZACIÓN FINALIZADO EXITOSAMENTE');
      console.log('✅ El vuelo AV92 ahora debe mostrar los nombres REALES de aeropuertos de la API');
      
    } catch (error: any) {
      console.error('💥 Error en proceso completo:', error);
      toast({
        title: "Error en Reseteo Completo",
        description: `No se pudo completar el reseteo: ${error.message || 'Error desconocido'}`,
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
        Reseteo Completo y Actualización de Datos de Vuelo
      </h3>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Ejecuta el proceso completo de reseteo que eliminará todos los datos existentes del vuelo AV92 
          y los reemplazará con información completamente fresca de la API de AviationStack.
        </p>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="font-medium text-orange-800 mb-2">⚠️ Proceso completo de reseteo:</h4>
          <ol className="text-sm text-orange-700 space-y-1 list-decimal list-inside">
            <li><strong>ELIMINA COMPLETAMENTE</strong> el registro del vuelo AV92 de la base de datos</li>
            <li>Limpia todo el caché del vuelo AV92</li>
            <li>Ejecuta consulta COMPLETAMENTE FRESCA a la API de AviationStack</li>
            <li>Crea un NUEVO registro con TODOS los datos completos incluyendo nombres reales de aeropuertos</li>
            <li>Verifica que los datos se hayan guardado correctamente</li>
            <li>Refresca la interfaz para mostrar los datos actualizados</li>
          </ol>
        </div>
        
        <Button 
          onClick={handleAutoRefresh}
          disabled={isProcessing}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          size="lg"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Procesando... (Eliminando y creando registro nuevo)
            </>
          ) : (
            <>
              <Trash2 className="h-5 w-5" />
              RESETEAR COMPLETAMENTE y Obtener Datos Frescos del Vuelo AV92
            </>
          )}
        </Button>
        
        {isProcessing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-700 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Ejecutando reseteo completo... Por favor espera mientras se elimina el registro anterior y se crean datos completamente frescos de la API.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
