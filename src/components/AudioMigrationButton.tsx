import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download, Loader2 } from 'lucide-react';

export function AudioMigrationButton() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      toast({
        title: "Iniciando migración",
        description: "Recuperando audios anteriores...",
      });

      const { data, error } = await supabase.functions.invoke('migrate-audio-messages');

      if (error) {
        throw error;
      }

      setMigrationResult(data);

      if (data.success) {
        toast({
          title: "Migración completada",
          description: `Se recuperaron ${data.migrated} audios de ${data.total} mensajes encontrados.`,
        });
      } else {
        throw new Error(data.error || 'Error en la migración');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        title: "Error en migración",
        description: error instanceof Error ? error.message : "No se pudo completar la migración",
        variant: "destructive"
      });
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={handleMigration}
          disabled={isMigrating}
          variant="outline"
          className="w-full sm:w-auto"
        >
          {isMigrating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Migrando audios...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Recuperar audios anteriores
            </>
          )}
        </Button>
      </div>

      {migrationResult && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Resultado de la migración:</h4>
          <div className="text-sm space-y-1">
            <p>• Total encontrados: <span className="font-medium">{migrationResult.total}</span></p>
            <p>• Recuperados exitosamente: <span className="font-medium text-green-600">{migrationResult.migrated}</span></p>
            <p>• Fallidos: <span className="font-medium text-red-600">{migrationResult.failed}</span></p>
          </div>
          
          {migrationResult.results && migrationResult.results.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">Ver detalles</summary>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {migrationResult.results.map((result: any, index: number) => (
                  <div key={index} className="text-xs py-1 border-b last:border-b-0">
                    <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {result.success ? '✓' : '✗'}
                    </span>
                    {' '}Mensaje: {result.messageId.substring(0, 8)}...
                    {result.error && <span className="text-red-500"> - {result.error}</span>}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}