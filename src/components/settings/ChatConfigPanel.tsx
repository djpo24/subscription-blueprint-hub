
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckCircle, AlertTriangle, Shield, Settings } from 'lucide-react';


export function ChatConfigPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sistema de Chat Manual
          </CardTitle>
          <CardDescription>
            Configuración y estado del sistema de chat completamente manual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sistema Completamente Manual */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Sistema de Respuestas Completamente Manual
            </h3>
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h4 className="font-medium text-green-800 mb-1">✅ Respuestas Manuales Únicas</h4>
                <p className="text-sm text-green-700">
                  El sistema está configurado para NUNCA generar respuestas por sí mismo. Todas las respuestas son escritas y enviadas manualmente por el operador. No hay funcionalidad de IA habilitada.
                </p>
              </div>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Sistema Manual Activo</span>
              </div>
              <p className="text-sm text-gray-600">
                Chat funcionando en modo completamente manual
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Sin IA</span>
              </div>
              <p className="text-sm text-gray-600">
                No hay inteligencia artificial conectada al sistema
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="font-medium">Control Total</span>
              </div>
              <p className="text-sm text-gray-600">
                Operador tiene control completo de todas las respuestas
              </p>
            </div>
          </div>

          {/* Funcionalidades del Sistema Manual */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Funcionalidades del Sistema Manual
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-100 text-green-800 mt-0.5">Manual</Badge>
                  <div>
                    <h4 className="font-medium">Respuestas Escritas por Operador</h4>
                    <p className="text-sm text-gray-600">
                      Cada respuesta es escrita manualmente por un operador humano
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-100 text-blue-800 mt-0.5">Controlado</Badge>
                  <div>
                    <h4 className="font-medium">Envío Manual de Mensajes</h4>
                    <p className="text-sm text-gray-600">
                      Los mensajes se envían únicamente cuando el operador lo decide
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-100 text-purple-800 mt-0.5">Humano</Badge>
                  <div>
                    <h4 className="font-medium">Atención Personalizada</h4>
                    <p className="text-sm text-gray-600">
                      Cada cliente recibe atención personal y contextualizada
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-orange-100 text-orange-800 mt-0.5">Seguro</Badge>
                  <div>
                    <h4 className="font-medium">Sin Respuestas No Deseadas</h4>
                    <p className="text-sm text-gray-600">
                      Garantía de que no se enviarán respuestas no solicitadas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-gray-100 text-gray-800 mt-0.5">Confiable</Badge>
                  <div>
                    <h4 className="font-medium">Control Total del Flujo</h4>
                    <p className="text-sm text-gray-600">
                      El operador controla completamente el flujo de conversación
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-red-100 text-red-800 mt-0.5">Bloqueado</Badge>
                  <div>
                    <h4 className="font-medium">IA Completamente Deshabilitada</h4>
                    <p className="text-sm text-gray-600">
                      No hay conexión a ningún sistema de inteligencia artificial
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Sistema */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Configuración del Sistema</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Modo de Operación</h4>
                <p className="text-sm text-gray-600 mb-2">Completamente Manual</p>
                <p className="text-xs text-gray-500">
                  Sistema configurado para operación 100% manual sin IA
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Inteligencia Artificial</h4>
                <p className="text-sm text-gray-600 mb-2">Completamente Deshabilitada</p>
                <p className="text-xs text-gray-500">
                  No hay conexión a sistemas de IA externos
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Control de Respuestas</h4>
                <p className="text-sm text-gray-600 mb-2">100% Operador Humano</p>
                <p className="text-xs text-gray-500">
                  Todas las respuestas requieren intervención humana
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Seguridad</h4>
                <p className="text-sm text-gray-600 mb-2">Máxima - Sin Respuestas No Solicitadas</p>
                <p className="text-xs text-gray-500">
                  Garantía de que no se enviarán mensajes no deseados
                </p>
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
