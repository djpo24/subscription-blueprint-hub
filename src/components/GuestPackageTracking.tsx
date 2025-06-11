
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search, Package, MapPin, Weight, Clock, ArrowRight } from 'lucide-react';
import { useGuestTracking } from '@/hooks/useGuestTracking';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function GuestPackageTracking() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const { trackPackage, clearResult, loading, trackingResult } = useGuestTracking();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackPackage(trackingNumber);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'recibido': 'bg-blue-100 text-blue-800',
      'bodega': 'bg-yellow-100 text-yellow-800',
      'procesado': 'bg-orange-100 text-orange-800',
      'transito': 'bg-purple-100 text-purple-800',
      'en_destino': 'bg-green-100 text-green-800',
      'delivered': 'bg-emerald-100 text-emerald-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'recibido': 'Recibido',
      'bodega': 'En Bodega',
      'procesado': 'Procesado',
      'transito': 'En Tránsito',
      'en_destino': 'En Destino',
      'delivered': 'Entregado',
    };
    return statusTexts[status] || status;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-6 w-6 text-black" />
          Rastrear Encomienda
        </CardTitle>
        <CardDescription>
          Ingresa tu número de rastreo para consultar el estado de tu encomienda
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tracking-input">Número de Rastreo</Label>
            <div className="flex gap-2">
              <Input
                id="tracking-input"
                type="text"
                placeholder="Ej: ENV-001-240101-001"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                disabled={loading}
                className="flex-1"
              />
              <Button 
                type="submit" 
                disabled={loading || !trackingNumber.trim()}
                className="shrink-0"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2 hidden sm:inline">
                  {loading ? 'Consultando...' : 'Buscar'}
                </span>
              </Button>
            </div>
          </div>
        </form>

        {trackingResult && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-black">
                Información de Rastreo
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearResult}
                className="text-gray-500 hover:text-gray-700"
              >
                Limpiar
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Número:</span>
                  <span className="text-sm font-mono">{trackingResult.tracking_number}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(trackingResult.status || 'pending')}>
                    {getStatusText(trackingResult.status || 'pending')}
                  </Badge>
                </div>

                {trackingResult.weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">Peso:</span>
                    <span className="text-sm">{trackingResult.weight} kg</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Ruta:</span>
                </div>
                <div className="flex items-center gap-2 text-sm pl-6">
                  <span>{trackingResult.origin}</span>
                  <ArrowRight className="h-3 w-3 text-gray-400" />
                  <span>{trackingResult.destination}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-600">Actualizado:</span>
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(trackingResult.updated_at || trackingResult.created_at || new Date()), {
                      addSuffix: true,
                      locale: es
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Solo se muestran datos básicos de rastreo para usuarios invitados</p>
          <p>• Límite de 10 consultas por día por dirección IP</p>
          <p>• Para información detallada, inicia sesión en el sistema</p>
        </div>
      </CardContent>
    </Card>
  );
}
