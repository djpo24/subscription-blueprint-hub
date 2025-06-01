
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TestResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

export function MetaConnectionTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const { toast } = useToast();

  const runConnectionTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    const results: TestResult[] = [];
    
    try {
      console.log('Iniciando pruebas de conexión con Meta...');
      
      // Test 1: Verificar configuración de credenciales
      results.push({
        test: 'Verificación de Credenciales',
        status: 'success',
        message: 'Iniciando verificación de credenciales en Supabase...'
      });

      // Test 2: Llamar edge function para validar token
      console.log('Llamando edge function para validar token...');
      const tokenValidationResponse = await supabase.functions.invoke('validate-meta-connection', {
        body: { testType: 'token_validation' }
      });

      if (tokenValidationResponse.error) {
        results.push({
          test: 'Validación de Token',
          status: 'error',
          message: 'Error al validar token de Meta',
          details: tokenValidationResponse.error
        });
      } else if (tokenValidationResponse.data?.success) {
        results.push({
          test: 'Validación de Token',
          status: 'success',
          message: 'Token de Meta válido',
          details: tokenValidationResponse.data
        });
      } else {
        results.push({
          test: 'Validación de Token',
          status: 'error',
          message: 'Token de Meta inválido o problema de configuración',
          details: tokenValidationResponse.data
        });
      }

      // Test 3: Verificar Phone Number ID
      console.log('Verificando Phone Number ID...');
      const phoneValidationResponse = await supabase.functions.invoke('validate-meta-connection', {
        body: { testType: 'phone_number_validation' }
      });

      if (phoneValidationResponse.error) {
        results.push({
          test: 'Validación de Phone Number ID',
          status: 'error',
          message: 'Error al validar Phone Number ID',
          details: phoneValidationResponse.error
        });
      } else if (phoneValidationResponse.data?.success) {
        results.push({
          test: 'Validación de Phone Number ID',
          status: 'success',
          message: 'Phone Number ID configurado correctamente',
          details: phoneValidationResponse.data
        });
      } else {
        results.push({
          test: 'Validación de Phone Number ID',
          status: 'error',
          message: 'Phone Number ID inválido o no configurado',
          details: phoneValidationResponse.data
        });
      }

      // Test 4: Test de conectividad general con Meta API
      console.log('Probando conectividad con Meta API...');
      const connectivityResponse = await supabase.functions.invoke('validate-meta-connection', {
        body: { testType: 'connectivity_test' }
      });

      if (connectivityResponse.error) {
        results.push({
          test: 'Conectividad con Meta API',
          status: 'error',
          message: 'No se puede conectar con Meta API',
          details: connectivityResponse.error
        });
      } else if (connectivityResponse.data?.success) {
        results.push({
          test: 'Conectividad con Meta API',
          status: 'success',
          message: 'Conexión exitosa con Meta API',
          details: connectivityResponse.data
        });
      } else {
        results.push({
          test: 'Conectividad con Meta API',
          status: 'warning',
          message: 'Conexión con Meta API con problemas',
          details: connectivityResponse.data
        });
      }

      setTestResults(results);

      // Mostrar resumen
      const errorCount = results.filter(r => r.status === 'error').length;
      const successCount = results.filter(r => r.status === 'success').length;

      if (errorCount === 0) {
        toast({
          title: "✅ Todas las pruebas pasaron",
          description: `${successCount} pruebas exitosas. La conexión con Meta está funcionando.`,
        });
      } else {
        toast({
          title: "⚠️ Problemas detectados",
          description: `${errorCount} errores encontrados. Revisa los detalles de las pruebas.`,
          variant: "destructive"
        });
      }

    } catch (error: any) {
      console.error('Error en las pruebas de conexión:', error);
      results.push({
        test: 'Pruebas Generales',
        status: 'error',
        message: 'Error general en las pruebas',
        details: error
      });
      setTestResults(results);
      
      toast({
        title: "❌ Error en las pruebas",
        description: error.message || "Error desconocido en las pruebas",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <Card className="bg-orange-50 border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Settings className="h-5 w-5" />
          Diagnóstico de Conexión Meta
        </CardTitle>
        <CardDescription className="text-orange-600">
          Verificar configuración y conectividad con Meta WhatsApp Business API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runConnectionTests}
            disabled={isTesting}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {isTesting ? 'Ejecutando pruebas...' : 'Ejecutar Diagnóstico de Conexión'}
          </Button>

          {testResults.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Resultados de las Pruebas:</h3>
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded border ${
                    result.status === 'success' ? 'bg-green-50 border-green-200' :
                    result.status === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="font-medium text-sm">{result.test}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.message}</div>
                      {result.details && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">Ver detalles</summary>
                          <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
