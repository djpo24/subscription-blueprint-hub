
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

export function DebugCustomersStatus() {
  const [showDebug, setShowDebug] = useState(false);
  const { data: userRole } = useCurrentUserRole();

  const { data: debugInfo, isLoading: debugLoading } = useQuery({
    queryKey: ['debug-customers'],
    queryFn: async () => {
      console.log('🔍 Ejecutando diagnóstico de clientes...');
      
      const results = {
        supabaseConnected: false,
        customersCount: 0,
        authStatus: 'unknown',
        userRole: userRole?.role || 'unknown',
        errors: [] as string[],
        rawCustomersData: null as any,
        permissionsTest: false
      };

      try {
        // Test 1: Verificar conexión a Supabase
        const { data: healthCheck } = await supabase.from('customers').select('count').limit(1);
        results.supabaseConnected = true;
        console.log('✅ Conexión a Supabase exitosa');

        // Test 2: Intentar obtener clientes directamente
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*');

        if (customersError) {
          results.errors.push(`Error SQL: ${customersError.message}`);
          console.error('❌ Error obteniendo clientes:', customersError);
        } else {
          results.customersCount = customersData?.length || 0;
          results.rawCustomersData = customersData;
          console.log('✅ Clientes obtenidos:', results.customersCount);
        }

        // Test 3: Verificar estado de autenticación
        const { data: { user } } = await supabase.auth.getUser();
        results.authStatus = user ? 'authenticated' : 'anonymous';

        // Test 4: Probar permisos específicos
        if (user) {
          try {
            const { error: insertError } = await supabase
              .from('customers')
              .insert({ 
                name: 'TEST_USER_DO_NOT_SAVE', 
                email: 'test@test.com', 
                phone: '0000000000' 
              })
              .select()
              .limit(0); // No insertar realmente

            results.permissionsTest = !insertError;
          } catch (permError) {
            results.errors.push(`Error de permisos: ${permError}`);
          }
        }

      } catch (error) {
        results.errors.push(`Error general: ${error.message}`);
        console.error('❌ Error en diagnóstico:', error);
      }

      return results;
    },
    enabled: showDebug
  });

  if (!showDebug) {
    return (
      <div className="mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebug(true)}
          className="text-xs"
        >
          🔧 Diagnosticar problemas de clientes
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center justify-between">
          🔧 Diagnóstico de Sistema - Clientes
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDebug(false)}
            className="text-xs"
          >
            Ocultar
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {debugLoading ? (
          <div className="text-sm text-gray-600">Ejecutando diagnóstico...</div>
        ) : debugInfo ? (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Conexión Supabase:</strong> 
                <span className={debugInfo.supabaseConnected ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                  {debugInfo.supabaseConnected ? '✅ Conectado' : '❌ Error'}
                </span>
              </div>
              
              <div>
                <strong>Estado Auth:</strong>
                <span className="ml-2">{debugInfo.authStatus}</span>
              </div>
              
              <div>
                <strong>Rol Usuario:</strong>
                <span className="ml-2">{debugInfo.userRole}</span>
              </div>
              
              <div>
                <strong>Clientes en DB:</strong>
                <span className={`ml-2 ${debugInfo.customersCount > 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  {debugInfo.customersCount}
                </span>
              </div>
            </div>

            {debugInfo.errors.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                <strong className="text-red-800">Errores detectados:</strong>
                <ul className="mt-2 space-y-1">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index} className="text-red-700 text-xs">• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {debugInfo.customersCount === 0 && debugInfo.supabaseConnected && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <strong className="text-yellow-800">Diagnóstico:</strong>
                <p className="text-yellow-700 text-xs mt-1">
                  La conexión funciona pero no hay clientes en la base de datos. 
                  Esto podría ser normal si es la primera vez que usas el sistema.
                </p>
              </div>
            )}

            {debugInfo.rawCustomersData && debugInfo.rawCustomersData.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <strong className="text-green-800">✅ Sistema funcionando correctamente</strong>
                <p className="text-green-700 text-xs mt-1">
                  Se encontraron {debugInfo.customersCount} clientes en la base de datos.
                </p>
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
