import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserCircle, Loader2 } from 'lucide-react';

export function ProfileMigrationButton() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsMigrating(true);
    setMigrationResult(null);

    try {
      toast({
        title: "Iniciando migración",
        description: "Recuperando fotos de perfil de WhatsApp...",
      });

      const { data, error } = await supabase.functions.invoke('migrate-profile-images');

      if (error) {
        throw error;
      }

      setMigrationResult(data);

      if (data.success) {
        toast({
          title: "Migración completada",
          description: `Se recuperaron ${data.migrated} fotos de perfil de ${data.total} clientes revisados.`,
        });
      } else {
        throw new Error(data.error || 'Error en la migración');
      }
    } catch (error) {
      console.error('Profile migration error:', error);
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
              Migrando fotos...
            </>
          ) : (
            <>
              <UserCircle className="h-4 w-4 mr-2" />
              Recuperar fotos de perfil
            </>
          )}
        </Button>
      </div>

      {migrationResult && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Resultado de la migración:</h4>
          <div className="text-sm space-y-1">
            <p>• Total revisados: <span className="font-medium">{migrationResult.total}</span></p>
            <p>• Fotos recuperadas: <span className="font-medium text-green-600">{migrationResult.migrated}</span></p>
            <p>• Sin foto disponible: <span className="font-medium text-yellow-600">{migrationResult.failed}</span></p>
          </div>
          
          {migrationResult.results && migrationResult.results.length > 0 && (
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-medium">Ver detalles</summary>
              <div className="mt-2 max-h-40 overflow-y-auto">
                {migrationResult.results.map((result: any, index: number) => (
                  <div key={index} className="text-xs py-1 border-b last:border-b-0">
                    <span className={result.success ? 'text-green-600' : 'text-yellow-600'}>
                      {result.success ? '✓' : '○'}
                    </span>
                    {' '}{result.customerName || 'Cliente'}
                    {result.error && <span className="text-gray-500"> - {result.error}</span>}
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