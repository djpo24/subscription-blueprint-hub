import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface MigrationResult {
  success: boolean;
  migrated: number;
  failed: number;
  total: number;
  results: Array<{
    customerId: string;
    customerName: string;
    success: boolean;
    profileUrl?: string;
    error?: string;
  }>;
}

export function ProfileImageMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      console.log('🚀 Starting profile image migration...');
      
      const { data, error } = await supabase.functions.invoke('migrate-profile-images', {
        body: {}
      });

      if (error) {
        throw error;
      }

      console.log('✅ Migration completed:', data);
      setResult(data);

      if (data.migrated > 0) {
        toast({
          title: "🎉 Migración completada",
          description: `Se migraron ${data.migrated} fotos de perfil exitosamente`,
        });
      } else {
        toast({
          title: "ℹ️ Migración completada",
          description: "No se encontraron fotos nuevas para migrar",
        });
      }

    } catch (error) {
      console.error('❌ Migration error:', error);
      toast({
        title: "❌ Error en la migración",
        description: error.message || 'Error desconocido',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Migración de Fotos de Perfil
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Obtiene automáticamente las fotos de perfil de WhatsApp para todos los clientes registrados
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleMigration}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Obteniendo fotos de perfil...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Migrar Fotos de Perfil
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Exitosas: {result.migrated}
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Fallidas: {result.failed}
              </Badge>
              <Badge variant="outline">
                Total: {result.total}
              </Badge>
            </div>

            {result.results && result.results.length > 0 && (
              <div className="max-h-96 overflow-y-auto space-y-2">
                <h4 className="text-sm font-medium">Resultados detallados:</h4>
                {result.results.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      item.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{item.customerName}</span>
                      {item.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    {item.success && item.profileUrl && (
                      <div className="mt-2 flex items-center gap-2">
                        <img 
                          src={item.profileUrl} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        <span className="text-xs text-green-700">
                          Foto obtenida exitosamente
                        </span>
                      </div>
                    )}
                    {!item.success && item.error && (
                      <div className="mt-1 text-xs text-red-600">
                        Error: {item.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>💡 Esta función obtiene las fotos de perfil de WhatsApp API usando el endpoint /contacts.</p>
          <p>⚠️ No todos los usuarios tienen fotos públicas disponibles.</p>
          <p>🔄 Las fotos se almacenan permanentemente en Supabase Storage.</p>
        </div>
      </CardContent>
    </Card>
  );
}