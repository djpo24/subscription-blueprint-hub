
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationValidation } from '@/hooks/useNotificationValidation';
import { MessageCircle, CheckCircle, XCircle, RotateCcw, Eye } from 'lucide-react';

interface NotificationValidationDialogProps {
  notification: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationValidationDialog({
  notification,
  open,
  onOpenChange
}: NotificationValidationDialogProps) {
  const [showTemplate, setShowTemplate] = useState(false);
  const { resendNotification, isResending } = useNotificationValidation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallido";
      default:
        return status;
    }
  };

  const handleResend = async () => {
    if (!notification.customers?.phone) {
      alert('No hay número de teléfono disponible para reenviar');
      return;
    }

    try {
      await resendNotification({
        notificationId: notification.id,
        customerId: notification.customer_id,
        packageId: notification.package_id,
        message: notification.message,
        phone: notification.customers.phone
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al reenviar:', error);
    }
  };

  const validateParameters = () => {
    const validations = [];
    
    // Validar datos básicos
    if (!notification.customers?.name) {
      validations.push({ field: 'Nombre del cliente', status: 'missing', message: 'No disponible' });
    } else {
      validations.push({ field: 'Nombre del cliente', status: 'valid', message: notification.customers.name });
    }

    if (!notification.customers?.phone) {
      validations.push({ field: 'Teléfono', status: 'missing', message: 'No disponible' });
    } else {
      validations.push({ field: 'Teléfono', status: 'valid', message: notification.customers.phone });
    }

    if (!notification.packages?.tracking_number) {
      validations.push({ field: 'Número de tracking', status: 'missing', message: 'No disponible' });
    } else {
      validations.push({ field: 'Número de tracking', status: 'valid', message: notification.packages.tracking_number });
    }

    // Validar mensaje
    if (!notification.message || notification.message.trim() === '') {
      validations.push({ field: 'Mensaje', status: 'missing', message: 'Mensaje vacío' });
    } else {
      validations.push({ field: 'Mensaje', status: 'valid', message: `${notification.message.length} caracteres` });
    }

    return validations;
  };

  const parameters = validateParameters();
  const hasErrors = parameters.some(param => param.status === 'missing');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Validación de Notificación
          </DialogTitle>
          <DialogDescription>
            Revisar parámetros y estado de la notificación
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estado actual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Estado Actual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(notification.status)}>
                  {getStatusLabel(notification.status)}
                </Badge>
                <span className="text-sm text-gray-500">
                  {notification.created_at ? new Date(notification.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
              {notification.error_message && (
                <div className="mt-2 p-2 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">
                    <strong>Error:</strong> {notification.error_message}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validación de parámetros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Validación de Parámetros</CardTitle>
              <CardDescription>
                Verificación de datos requeridos para el envío
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {parameters.map((param, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                    <div className="flex items-center gap-2">
                      {param.status === 'valid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{param.field}</span>
                    </div>
                    <span className={`text-sm ${param.status === 'valid' ? 'text-green-700' : 'text-red-700'}`}>
                      {param.message}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mensaje y plantilla */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Mensaje
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplate(!showTemplate)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showTemplate ? 'Ocultar' : 'Ver'} Detalles
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Tipo:</span>
                  <span className="ml-2">{notification.notification_type || 'N/A'}</span>
                </div>
                
                {showTemplate && (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium text-gray-600 mb-2">Mensaje completo:</p>
                    <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            
            {notification.status === 'failed' && (
              <Button
                onClick={handleResend}
                disabled={isResending || hasErrors}
                className="flex items-center gap-2"
              >
                {isResending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Reenviando...
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4" />
                    Reenviar
                  </>
                )}
              </Button>
            )}
          </div>

          {hasErrors && notification.status === 'failed' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-700">
                <strong>Advertencia:</strong> Hay parámetros faltantes que pueden causar errores en el reenvío.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
