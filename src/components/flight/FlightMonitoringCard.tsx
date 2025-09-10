
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageSquare, Shield } from 'lucide-react';

export function FlightMonitoringCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Sistema de Monitoreo DESHABILITADO
            </CardTitle>
            <CardDescription>
              Todas las funciones de monitoreo automático han sido eliminadas completamente
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Disabled status */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h4 className="font-medium text-red-900">Monitoreo Automático ELIMINADO</h4>
            </div>
            <p className="text-sm text-red-700 mt-2">
              El sistema de monitoreo automático ha sido completamente eliminado. No hay funcionalidad automática de envío de notificaciones.
            </p>
          </div>

          {/* Manual only section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              <h4 className="font-medium text-gray-900">Solo Sistema Manual</h4>
            </div>
            <ul className="text-sm text-gray-800 space-y-1">
              <li>• NO hay monitoreo automático de vuelos</li>
              <li>• NO hay notificaciones automáticas</li>
              <li>• NO hay envío automático de mensajes</li>
              <li>• Todas las comunicaciones deben ser manuales</li>
              <li>• Control total del operador humano</li>
            </ul>
          </div>

          {/* Security confirmation */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-5 w-5 text-green-600" />
              <h4 className="font-medium text-green-900">Seguridad Garantizada</h4>
            </div>
            <p className="text-sm text-green-700">
              No se enviarán mensajes automáticos no deseados. Todas las respuestas son 100% manuales.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
