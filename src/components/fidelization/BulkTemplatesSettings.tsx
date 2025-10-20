import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useBulkFidelizationSettings } from '@/hooks/useBulkFidelizationSettings';
import { useUpdateBulkFidelizationSettings } from '@/hooks/useUpdateBulkFidelizationSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BulkTemplatesSettings() {
  const { data: settings, isLoading } = useBulkFidelizationSettings();
  const updateMutation = useUpdateBulkFidelizationSettings();

  const [redeemableTemplate, setRedeemableTemplate] = useState('');
  const [redeemableUseTemplate, setRedeemableUseTemplate] = useState(false);
  const [redeemableTemplateName, setRedeemableTemplateName] = useState('');
  const [redeemableTemplateLanguage, setRedeemableTemplateLanguage] = useState('es_CO');

  const [motivationalTemplate, setMotivationalTemplate] = useState('');
  const [motivationalUseTemplate, setMotivationalUseTemplate] = useState(false);
  const [motivationalTemplateName, setMotivationalTemplateName] = useState('');
  const [motivationalTemplateLanguage, setMotivationalTemplateLanguage] = useState('es_CO');

  useEffect(() => {
    if (settings) {
      setRedeemableTemplate(settings.redeemable_template);
      setRedeemableUseTemplate(settings.redeemable_use_template || false);
      setRedeemableTemplateName(settings.redeemable_template_name || '');
      setRedeemableTemplateLanguage(settings.redeemable_template_language || 'es_CO');

      setMotivationalTemplate(settings.motivational_template);
      setMotivationalUseTemplate(settings.motivational_use_template || false);
      setMotivationalTemplateName(settings.motivational_template_name || '');
      setMotivationalTemplateLanguage(settings.motivational_template_language || 'es_CO');
    }
  }, [settings]);

  const handleSubmit = () => {
    updateMutation.mutate({
      redeemableTemplate,
      redeemableUseTemplate,
      redeemableTemplateName: redeemableUseTemplate ? redeemableTemplateName : undefined,
      redeemableTemplateLanguage: redeemableUseTemplate ? redeemableTemplateLanguage : undefined,
      motivationalTemplate,
      motivationalUseTemplate,
      motivationalTemplateName: motivationalUseTemplate ? motivationalTemplateName : undefined,
      motivationalTemplateLanguage: motivationalUseTemplate ? motivationalTemplateLanguage : undefined,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Plantillas Masivas</CardTitle>
        <CardDescription>
          Configura las plantillas de mensajes que se enviarán automáticamente a los clientes según sus puntos acumulados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="redeemable" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="redeemable">Clientes con ≥1000 Puntos</TabsTrigger>
            <TabsTrigger value="motivational">Clientes con &lt;1000 Puntos</TabsTrigger>
          </TabsList>

          <TabsContent value="redeemable" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="redeemable-use-template">Usar Plantilla de WhatsApp Business</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar usando una plantilla aprobada de WhatsApp Business
                  </p>
                </div>
                <Switch
                  id="redeemable-use-template"
                  checked={redeemableUseTemplate}
                  onCheckedChange={setRedeemableUseTemplate}
                />
              </div>

              {redeemableUseTemplate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="redeemable-template-name">Nombre de la Plantilla</Label>
                    <Input
                      id="redeemable-template-name"
                      value={redeemableTemplateName}
                      onChange={(e) => setRedeemableTemplateName(e.target.value)}
                      placeholder="redemption_available"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="redeemable-template-language">Idioma de la Plantilla</Label>
                    <Input
                      id="redeemable-template-language"
                      value={redeemableTemplateLanguage}
                      onChange={(e) => setRedeemableTemplateLanguage(e.target.value)}
                      placeholder="es_CO"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="redeemable-template">
                  Plantilla de Mensaje {!redeemableUseTemplate && '(Fallback)'}
                </Label>
                <Textarea
                  id="redeemable-template"
                  value={redeemableTemplate}
                  onChange={(e) => setRedeemableTemplate(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Mensaje para clientes que pueden canjear..."
                />
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {'{'}{'{'} nombre_cliente {'}'}{'}'},  {'{'}{'{'} puntos_disponibles {'}'}{'}'},  {'{'}{'{'} kilos_disponibles {'}'}{'}'} 
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="motivational" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="motivational-use-template">Usar Plantilla de WhatsApp Business</Label>
                  <p className="text-sm text-muted-foreground">
                    Enviar usando una plantilla aprobada de WhatsApp Business
                  </p>
                </div>
                <Switch
                  id="motivational-use-template"
                  checked={motivationalUseTemplate}
                  onCheckedChange={setMotivationalUseTemplate}
                />
              </div>

              {motivationalUseTemplate && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="motivational-template-name">Nombre de la Plantilla</Label>
                    <Input
                      id="motivational-template-name"
                      value={motivationalTemplateName}
                      onChange={(e) => setMotivationalTemplateName(e.target.value)}
                      placeholder="points_progress"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivational-template-language">Idioma de la Plantilla</Label>
                    <Input
                      id="motivational-template-language"
                      value={motivationalTemplateLanguage}
                      onChange={(e) => setMotivationalTemplateLanguage(e.target.value)}
                      placeholder="es_CO"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="motivational-template">
                  Plantilla de Mensaje {!motivationalUseTemplate && '(Fallback)'}
                </Label>
                <Textarea
                  id="motivational-template"
                  value={motivationalTemplate}
                  onChange={(e) => setMotivationalTemplate(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Mensaje motivacional para clientes..."
                />
                <p className="text-sm text-muted-foreground">
                  Variables disponibles: {'{'}{'{'} nombre_cliente {'}'}{'}'},  {'{'}{'{'} puntos_disponibles {'}'}{'}'},  {'{'}{'{'} puntos_faltantes {'}'}{'}'} 
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={updateMutation.isPending}
            className="w-full"
          >
            {updateMutation.isPending ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
