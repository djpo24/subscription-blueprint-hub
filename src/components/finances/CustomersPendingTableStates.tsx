
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

interface CustomersPendingTableStatesProps {
  isLoading?: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  onRetry?: () => void;
}

export function CustomersPendingTableStates({
  isLoading,
  error,
  isEmpty,
  onRetry
}: CustomersPendingTableStatesProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando clientes con pagos pendientes...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar datos de clientes</p>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            {onRetry && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay clientes con pagos pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
