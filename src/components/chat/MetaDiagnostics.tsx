
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Settings, Wifi } from 'lucide-react';
import { testMetaConnection, testAudioUrl, MetaDiagnosticResult } from '@/utils/metaDiagnostics';
import { useToast } from '@/hooks/use-toast';

interface DiagnosticResults {
  tokenValidation: MetaDiagnosticResult;
  phoneValidation: MetaDiagnosticResult;
  connectivity: MetaDiagnosticResult;
}

export function MetaDiagnostics() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [audioTestUrl, setAudioTestUrl] = useState('');
  const [audioTestResult, setAudioTestResult] = useState<MetaDiagnosticResult | null>(null);
  const { toast } = useToast();

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await testMetaConnection();
      setResults(diagnosticResults);
      
      if (diagnosticResults.tokenValidation.success && 
          diagnosticResults.phoneValidation.success && 
          diagnosticResults.connectivity.success) {
        toast({
          title: "✅ Configuración correcta",
          description: "Todas las pruebas de conectividad pasaron exitosamente"
        });
      } else {
        toast({
          title: "⚠️ Problemas encontrados",
          description: "Revisa los resultados para ver qué configuraciones necesitan atención",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error en diagnósticos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const testAudio = async () => {
    if (!audioTestUrl.trim()) {
      toast({
        title: "URL requerida",
        description: "Por favor ingresa una URL de audio para probar",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await testAudioUrl(audioTestUrl);
      setAudioTestResult(result);
      
      if (result.success) {
        toast({
          title: "✅ Audio accesible",
          description: result.message
        });
      } else {
        toast({
          title: "❌ Problema con el audio",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error probando audio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const renderResult = (result: MetaDiagnosticResult, title: string) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center gap-2">
        {result.success ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <span className="font-medium">{title}</span>
      </div>
      <Badge variant={result.success ? "default" : "destructive"} className={result.success ? "bg-green-100 text-green-800 border-green-200" : ""}>
        {result.success ? "OK" : "Error"}
      </Badge>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Diagnósticos de Meta/WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? "Ejecutando diagnósticos..." : "Ejecutar diagnósticos"}
          </Button>

          {results && (
            <div className="space-y-3">
              {renderResult(results.tokenValidation, "Token de acceso")}
              {renderResult(results.phoneValidation, "Phone Number ID")}
              {renderResult(results.connectivity, "Conectividad con Meta")}

              {!results.tokenValidation.success && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">
                    <strong>Problema con el token:</strong> {results.tokenValidation.message}
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    Ve a la configuración de Meta y actualiza tu token de acceso.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Prueba de URL de Audio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Pega aquí la URL del audio de WhatsApp"
              value={audioTestUrl}
              onChange={(e) => setAudioTestUrl(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <Button onClick={testAudio}>
              Probar
            </Button>
          </div>

          {audioTestResult && (
            <div className="space-y-2">
              {renderResult(audioTestResult, "Acceso al audio")}
              
              {audioTestResult.details && (
                <div className="p-3 bg-gray-50 border rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Detalles:</strong>
                  </p>
                  <pre className="text-xs text-gray-800 mt-1">
                    {JSON.stringify(audioTestResult.details, null, 2)}
                  </pre>
                </div>
              )}

              {!audioTestResult.success && audioTestResult.message.includes('CORS') && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    <strong>Solución recomendada:</strong> Los audios de WhatsApp requieren un proxy del servidor 
                    debido a las políticas CORS de Meta. Esto es normal y esperado.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
