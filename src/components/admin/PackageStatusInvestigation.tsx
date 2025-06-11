
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, Clock, User, Package, AlertTriangle } from 'lucide-react';
import { usePackageStatusInvestigation } from '@/hooks/usePackageStatusInvestigation';

export function PackageStatusInvestigation() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const { 
    investigatePackage, 
    investigationResult, 
    isLoading 
  } = usePackageStatusInvestigation();

  const handleInvestigate = () => {
    if (trackingNumber.trim()) {
      investigatePackage(trackingNumber.trim());
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'recibido': 'bg-blue-100 text-blue-800',
      'bodega': 'bg-gray-100 text-gray-800',
      'procesado': 'bg-orange-100 text-orange-800',
      'transito': 'bg-purple-100 text-purple-800',
      'en_destino': 'bg-yellow-100 text-yellow-800',
      'delivered': 'bg-green-100 text-green-800',
      'in_transit': 'bg-purple-100 text-purple-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionTypeColor = (actionType: string) => {
    const colors = {
      'update': 'bg-orange-100 text-orange-800',
      'create': 'bg-green-100 text-green-800',
      'delete': 'bg-red-100 text-red-800',
      'status_change': 'bg-purple-100 text-purple-800'
    };
    return colors[actionType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Investigación de Cambios de Estado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulario de búsqueda */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="trackingNumber">Número de Tracking</Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Ingrese el número de tracking"
              onKeyPress={(e) => e.key === 'Enter' && handleInvestigate()}
            />
          </div>
          <Button 
            onClick={handleInvestigate}
            disabled={isLoading || !trackingNumber.trim()}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            {isLoading ? 'Investigando...' : 'Investigar'}
          </Button>
        </div>

        {/* Resultados de la investigación */}
        {investigationResult && (
          <div className="space-y-6">
            {/* Información del paquete */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Información del Paquete
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Tracking</Label>
                    <p className="font-mono">{investigationResult.package.tracking_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Estado Actual</Label>
                    <Badge className={getStatusColor(investigationResult.package.status)}>
                      {investigationResult.package.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <p>{investigationResult.package.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Última Actualización</Label>
                    <p className="text-sm">{formatDate(investigationResult.package.updated_at)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Eventos de tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Historial de Eventos (Tracking Events)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investigationResult.trackingEvents.length === 0 ? (
                  <p className="text-gray-500 italic">No se encontraron eventos de tracking</p>
                ) : (
                  <div className="space-y-3">
                    {investigationResult.trackingEvents.map((event, index) => (
                      <div key={event.id} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {event.event_type}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDate(event.created_at || new Date().toISOString())}
                          </span>
                        </div>
                        <p className="font-medium">{event.description}</p>
                        {event.location && (
                          <p className="text-sm text-gray-600">📍 {event.location}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones de usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Acciones de Usuario (User Actions)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {investigationResult.userActions.length === 0 ? (
                  <p className="text-gray-500 italic">No se encontraron acciones de usuario para este paquete</p>
                ) : (
                  <div className="space-y-4">
                    {investigationResult.userActions.map((action, index) => (
                      <div key={action.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getActionTypeColor(action.action_type)}>
                              {action.action_type}
                            </Badge>
                            <span className="font-medium">{action.user_name}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {formatDate(action.created_at)}
                          </span>
                        </div>
                        
                        <p className="text-sm mb-3">{action.description}</p>
                        
                        {action.old_values && action.new_values && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-xs font-medium text-red-600">Valores Anteriores</Label>
                              <pre className="bg-red-50 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(action.old_values, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <Label className="text-xs font-medium text-green-600">Valores Nuevos</Label>
                              <pre className="bg-green-50 p-2 rounded text-xs overflow-x-auto">
                                {JSON.stringify(action.new_values, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Análisis y conclusiones */}
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-lg text-yellow-800">
                  🔍 Análisis de los Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  {investigationResult.analysis && (
                    <div>
                      <h4 className="font-medium mb-2">Posibles Causas del Cambio a "en transito":</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        {investigationResult.analysis.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
