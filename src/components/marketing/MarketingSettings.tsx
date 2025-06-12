
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMarketingSettings } from '@/hooks/useMarketingSettings';
import { useUpdateMarketingSettings } from '@/hooks/useUpdateMarketingSettings';
import { useToast } from '@/hooks/use-toast';
import { Save, TestTube } from 'lucide-react';

export function MarketingSettings() {
  const { data: settings, isLoading } = useMarketingSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateMarketingSettings();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    messageFrequencyDays: 15,
    tripWindowDays: 30,
    autoSendEnabled: true,
    messageTemplate: ''
  });

  // Actualizar form cuando lleguen los datos
  useEffect(() => {
    if (settings) {
      setFormData({
        messageFrequencyDays: settings.message_frequency_days,
        tripWindowDays: settings.trip_window_days,
        autoSendEnabled: settings.auto_send_enabled,
        messageTemplate: settings.message_template
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings(formData);
      toast({
        title: "Configuración guardada",
        description: "Los cambios se han aplicado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    }
  };

  const handleTestMessage = () => {
    const testMessage = formData.messageTemplate
      .replace('{customer_name}', 'María González')
      .replace('{trip_details}', '📦 15/06/2024 - Envío Barranquilla → Curazao (Vuelo: AA123)\n📦 20/06/2024 - Envío Curazao → Barranquilla (Vuelo: AA456)');
    
    toast({
      title: "Vista previa del mensaje",
      description: testMessage,
      duration: 8000
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Marketing</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frecuencia de envío (días)</Label>
              <Input
                id="frequency"
                type="number"
                min="1"
                max="90"
                value={formData.messageFrequencyDays}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  messageFrequencyDays: parseInt(e.target.value) || 15
                }))}
              />
              <p className="text-sm text-gray-500">
                Cada cuántos días enviar campañas automáticas
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="window">Ventana de envíos (días)</Label>
              <Input
                id="window"
                type="number"
                min="7"
                max="90"
                value={formData.tripWindowDays}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  tripWindowDays: parseInt(e.target.value) || 30
                }))}
              />
              <p className="text-sm text-gray-500">
                Informar sobre envíos programados en los próximos X días
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto-send"
              checked={formData.autoSendEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({
                ...prev,
                autoSendEnabled: checked
              }))}
            />
            <Label htmlFor="auto-send">Envío automático habilitado</Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Plantilla del mensaje</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestMessage}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                Vista previa
              </Button>
            </div>
            <Textarea
              id="template"
              placeholder="Plantilla del mensaje..."
              value={formData.messageTemplate}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                messageTemplate: e.target.value
              }))}
              rows={8}
            />
            <div className="text-sm text-gray-500">
              <p className="mb-2">Variables disponibles:</p>
              <ul className="list-disc list-inside space-y-1">
                <li><code>{'{customer_name}'}</code> - Nombre del cliente</li>
                <li><code>{'{trip_details}'}</code> - Lista de envíos programados</li>
              </ul>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            {isPending ? 'Guardando...' : 'Guardar configuración'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
