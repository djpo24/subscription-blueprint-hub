
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Megaphone, Send, Eye, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCustomerData } from '@/hooks/useCustomerData';

const CAMPAIGN_TEMPLATE = `¡Hola {{nombre_cliente}}! 👋

🛫 **IMPORTANTE: Próximo viaje programado**

Te informamos que tenemos un viaje programado próximamente:

📅 **Salida desde Barranquilla:** {{fecha_salida_baq}}
📅 **Retorno desde Curazao:** {{fecha_retorno_cur}}

⏰ **FECHA LÍMITE para entrega de encomiendas:**
🗓️ **{{fecha_limite_entrega}} antes de las 3:00 PM**

📦 Si tienes alguna encomienda para enviar, por favor asegúrate de entregarla antes de la fecha límite.

📞 Para coordinar la entrega o resolver dudas, contáctanos.

✈️ **Envíos Ojito** - Conectando Barranquilla y Curazao`;

export function CampaignNotificationsPanel() {
  const [template, setTemplate] = useState(CAMPAIGN_TEMPLATE);
  const [selectedTemplate, setSelectedTemplate] = useState('proximos_viajes');
  const [outboundDate, setOutboundDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [loadedCustomers, setLoadedCustomers] = useState<any[]>([]);
  
  const { toast } = useToast();
  const { data: customers, isLoading: loadingCustomers } = useCustomerData();

  const handleLoadCustomers = () => {
    if (!customers || customers.length === 0) {
      toast({
        title: "Sin clientes",
        description: "No se encontraron clientes registrados en el sistema",
        variant: "destructive"
      });
      return;
    }

    setLoadedCustomers(customers);
    toast({
      title: "Clientes cargados",
      description: `Se cargaron ${customers.length} clientes para la campaña`,
    });
  };

  const handlePreview = () => {
    setIsPreview(!isPreview);
  };

  const handleSendCampaign = () => {
    if (!outboundDate || !returnDate || !deadlineDate) {
      toast({
        title: "Error",
        description: "Por favor completa todas las fechas antes de enviar la campaña",
        variant: "destructive"
      });
      return;
    }

    if (loadedCustomers.length === 0) {
      toast({
        title: "Error",
        description: "Debes cargar los clientes antes de enviar la campaña",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Campaña enviada",
      description: `La campaña de notificación ha sido enviada a ${loadedCustomers.length} clientes`,
    });
  };

  const previewTemplate = template
    .replace(/{{nombre_cliente}}/g, 'Juan Pérez')
    .replace(/{{fecha_salida_baq}}/g, outboundDate || '[fecha_salida_baq]')
    .replace(/{{fecha_retorno_cur}}/g, returnDate || '[fecha_retorno_cur]')
    .replace(/{{fecha_limite_entrega}}/g, deadlineDate || '[fecha_limite_entrega]');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            Campaña de Notificaciones
          </CardTitle>
          <CardDescription>
            Envía notificaciones masivas sobre próximos viajes a todos los clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuración de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="outbound-date">Fecha Salida Barranquilla</Label>
              <Input
                id="outbound-date"
                type="date"
                value={outboundDate}
                onChange={(e) => setOutboundDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="return-date">Fecha Retorno Curazao</Label>
              <Input
                id="return-date"
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadline-date">Fecha Límite Entrega</Label>
              <Input
                id="deadline-date"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
              />
            </div>
          </div>

          {/* Selector de plantilla */}
          <div className="space-y-2">
            <Label htmlFor="template-select">Plantilla de WhatsApp</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una plantilla" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proximos_viajes">Próximos Viajes</SelectItem>
                <SelectItem value="urgente_viaje">Viaje Urgente</SelectItem>
                <SelectItem value="recordatorio">Recordatorio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botón para cargar clientes */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleLoadCustomers}
              disabled={loadingCustomers}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Package className="h-4 w-4" />
              {loadingCustomers ? 'Cargando...' : 'Cargar Paquetes'}
            </Button>
            {loadedCustomers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Users className="h-4 w-4" />
                <span>{loadedCustomers.length} clientes cargados</span>
              </div>
            )}
          </div>

          {/* Editor de plantilla */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="template">Mensaje de la Plantilla</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {isPreview ? 'Editar' : 'Vista Previa'}
              </Button>
            </div>
            {isPreview ? (
              <div className="p-4 bg-muted rounded-md border">
                <p className="text-sm font-medium mb-2">Vista previa:</p>
                <div className="whitespace-pre-wrap text-sm">
                  {previewTemplate}
                </div>
              </div>
            ) : (
              <Textarea
                id="template"
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                rows={15}
                placeholder="Escribe tu mensaje aquí..."
                className="font-mono text-sm"
              />
            )}
          </div>

          {/* Información de variables */}
          <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Variables disponibles:</h4>
            <div className="text-sm text-blue-700 space-y-1">
              <p><code>{"{{nombre_cliente}}"}</code> - Nombre del cliente</p>
              <p><code>{"{{fecha_salida_baq}}"}</code> - Fecha de salida desde Barranquilla</p>
              <p><code>{"{{fecha_retorno_cur}}"}</code> - Fecha de retorno desde Curazao</p>
              <p><code>{"{{fecha_limite_entrega}}"}</code> - Fecha límite para entrega</p>
            </div>
          </div>

          {/* Lista de clientes cargados */}
          {loadedCustomers.length > 0 && (
            <div className="p-4 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">Clientes que recibirán la campaña:</h4>
              <div className="max-h-32 overflow-y-auto">
                <div className="text-sm text-green-700 space-y-1">
                  {loadedCustomers.slice(0, 10).map((customer, index) => (
                    <p key={customer.id}>
                      {index + 1}. {customer.name} - {customer.phone}
                    </p>
                  ))}
                  {loadedCustomers.length > 10 && (
                    <p className="font-medium">
                      ... y {loadedCustomers.length - 10} clientes más
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4" />
              <span>
                {loadedCustomers.length > 0 
                  ? `Enviará a ${loadedCustomers.length} clientes cargados`
                  : 'Primero carga los clientes con "Cargar Paquetes"'
                }
              </span>
            </div>
            <Button onClick={handleSendCampaign} className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Enviar Campaña
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
