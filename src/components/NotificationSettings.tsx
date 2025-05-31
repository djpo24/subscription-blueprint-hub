
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings } from 'lucide-react';

export function NotificationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [enableArrivalNotifications, setEnableArrivalNotifications] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [notificationTemplate, setNotificationTemplate] = useState('');

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['notification-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
      return data;
    }
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (settings) {
      setEnableArrivalNotifications(settings.enable_arrival_notifications ?? true);
      setWhatsappEnabled(settings.whatsapp_enabled ?? true);
    }
  }, [settings]);

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      if (settings) {
        // Update existing settings
        const { error } = await supabase
          .from('notification_settings')
          .update(newSettings)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('notification_settings')
          .insert(newSettings);
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
      toast({
        title: "Configuración actualizada",
        description: "Los ajustes de notificación se guardaron correctamente",
      });
    },
    onError: (error: any) => {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los ajustes",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate({
      enable_arrival_notifications: enableArrivalNotifications,
      whatsapp_enabled: whatsappEnabled,
      updated_at: new Date().toISOString()
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Cargando configuración...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <CardDescription>
          Personaliza cómo y cuándo se envían las notificaciones a los clientes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificaciones de Llegada</Label>
              <div className="text-sm text-gray-500">
                Enviar notificaciones automáticas cuando los vuelos lleguen
              </div>
            </div>
            <Switch
              checked={enableArrivalNotifications}
              onCheckedChange={setEnableArrivalNotifications}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>WhatsApp Habilitado</Label>
              <div className="text-sm text-gray-500">
                Usar WhatsApp como canal principal de notificaciones
              </div>
            </div>
            <Switch
              checked={whatsappEnabled}
              onCheckedChange={setWhatsappEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label>Plantilla de Mensaje (Opcional)</Label>
            <Input
              placeholder="Ej: Estimado {cliente}, su encomienda {tracking} ha llegado..."
              value={notificationTemplate}
              onChange={(e) => setNotificationTemplate(e.target.value)}
            />
            <div className="text-sm text-gray-500">
              Variables disponibles: {'{cliente}'}, {'{tracking}'}, {'{destino}'}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button 
            onClick={handleSaveSettings}
            disabled={updateSettingsMutation.isPending}
            className="w-full md:w-auto"
          >
            {updateSettingsMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Las notificaciones se envían automáticamente cuando los vuelos aterrizan</li>
            <li>• Asegúrate de que los clientes tengan números de WhatsApp válidos</li>
            <li>• El sistema verifica el estado cada 30 segundos</li>
            <li>• Puedes enviar notificaciones manuales desde la sección de paquetes</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
