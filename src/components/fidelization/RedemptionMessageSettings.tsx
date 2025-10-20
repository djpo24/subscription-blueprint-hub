import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRedemptionMessageSettings } from '@/hooks/useRedemptionMessageSettings';
import { useUpdateRedemptionMessageSettings } from '@/hooks/useUpdateRedemptionMessageSettings';
import { useToast } from '@/hooks/use-toast';
import { Save, TestTube, MessageSquare, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function RedemptionMessageSettings() {
  const { data: settings, isLoading } = useRedemptionMessageSettings();
  const { mutateAsync: updateSettings, isPending } = useUpdateRedemptionMessageSettings();
  const { toast } = useToast();

  const [messageTemplate, setMessageTemplate] = useState('');
  const [useTemplate, setUseTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateLanguage, setTemplateLanguage] = useState('es_CO');

  useEffect(() => {
    if (settings) {
      setMessageTemplate(settings.message_template);
      setUseTemplate(settings.use_template || false);
      setTemplateName(settings.template_name || '');
      setTemplateLanguage(settings.template_language || 'es_CO');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings({ 
        messageTemplate,
        useTemplate,
        templateName,
        templateLanguage
      });
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleTestMessage = () => {
    const testMessage = messageTemplate
      .replace(/{{codigo}}/g, '1234');
    
    toast({
      title: "Vista previa del mensaje",
      description: testMessage,
      duration: 10000
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vista Previa de la Plantilla */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Plantilla de Mensaje de Redención
          </CardTitle>
          <CardDescription>
            Esta es la plantilla que se enviará a los clientes al canjear sus puntos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm text-sm whitespace-pre-wrap font-sans">
              {messageTemplate
                .replace(/{{codigo}}/g, '1234')}
            </div>
          </div>
          
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestMessage}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Vista previa en toast
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Plantilla de WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Plantilla de WhatsApp Business
          </CardTitle>
          <CardDescription>
            Configura los parámetros de la plantilla de WhatsApp Business API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Usar Plantilla */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="use-template">Usar plantilla de WhatsApp Business</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar usando una plantilla aprobada en WhatsApp Business Manager
                </p>
              </div>
              <Switch
                id="use-template"
                checked={useTemplate}
                onCheckedChange={setUseTemplate}
              />
            </div>

            <Separator />

            {/* Campos de Plantilla */}
            {useTemplate && (
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nombre de la plantilla *</Label>
                  <Input
                    id="template-name"
                    placeholder="ej: redemption_code"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    required={useTemplate}
                  />
                  <p className="text-xs text-muted-foreground">
                    Debe coincidir exactamente con el nombre en WhatsApp Business Manager
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-language">Idioma de la plantilla *</Label>
                  <Select value={templateLanguage} onValueChange={setTemplateLanguage}>
                    <SelectTrigger id="template-language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es_CO">Español (Colombia)</SelectItem>
                      <SelectItem value="es_MX">Español (México)</SelectItem>
                      <SelectItem value="es_ES">Español (España)</SelectItem>
                      <SelectItem value="es">Español (General)</SelectItem>
                      <SelectItem value="en_US">English (US)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-300 dark:border-blue-700">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    📋 Parámetro de la plantilla aprobada:
                  </p>
                  <ul className="text-sm space-y-1 text-blue-800 dark:text-blue-200">
                    <li>1. Código de verificación - 4 dígitos</li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ La plantilla aprobada solo debe tener un parámetro: el código
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ejemplo: "1234 es tu código de verificación."
                  </p>
                </div>
              </div>
            )}

            {/* Plantilla de Mensaje (Fallback) */}
            <div className="space-y-2">
              <Label htmlFor="template">
                Plantilla del mensaje {useTemplate && '(fallback si la plantilla falla)'}
              </Label>
              <Textarea
                id="template"
                placeholder="Escribe tu plantilla personalizada aquí..."
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                rows={12}
                className="font-mono text-sm"
              />
              
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  📝 Variables disponibles (mensaje de respaldo):
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded text-blue-900 dark:text-blue-100 font-mono">
                      {'{{codigo}}'}
                    </code>
                    <span className="text-gray-700 dark:text-gray-300">- Código de verificación de 4 dígitos</span>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  ⚠️ Solo la variable del código está disponible. El mensaje de respaldo se usa únicamente si la plantilla de WhatsApp Business no está configurada.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isPending || !messageTemplate.trim() || (useTemplate && !templateName.trim())} 
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Guardando...' : 'Guardar configuración'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
