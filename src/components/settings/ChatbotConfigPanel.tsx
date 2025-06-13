
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bot, CheckCircle, AlertTriangle, Clock, Zap, Shield, Brain, Settings } from 'lucide-react';
import { AdvancedBotToggleButton } from '@/components/chat/AdvancedBotToggleButton';

export function ChatbotConfigPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Configuración del Chatbot SARA
          </CardTitle>
          <CardDescription>
            Información técnica y estado del sistema de respuestas automáticas de WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Principal del Bot */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Control del Sistema
            </h3>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">Sistema de Respuestas Automáticas</h4>
                  <p className="text-sm text-blue-700">
                    Controla el comportamiento del bot para respuestas automáticas y manuales
                  </p>
                </div>
                <AdvancedBotToggleButton />
              </div>
            </div>
          </div>

          {/* Estado del Sistema */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Sistema Activo</span>
              </div>
              <p className="text-sm text-gray-600">
                Bot funcionando correctamente con verificación avanzada
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Verificación Activa</span>
              </div>
              <p className="text-sm text-gray-600">
                Sistema de verificación de respuestas en 2 pasos
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span className="font-medium">IA Avanzada</span>
              </div>
              <p className="text-sm text-gray-600">
                GPT-4 con contexto específico de negocio
              </p>
            </div>
          </div>

          {/* Funcionalidades Principales */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Funcionalidades Principales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-100 text-green-800 mt-0.5">Activo</Badge>
                  <div>
                    <h4 className="font-medium">Consultas de Encomiendas</h4>
                    <p className="text-sm text-gray-600">
                      Respuestas inteligentes sobre el estado de paquetes específicos
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-100 text-green-800 mt-0.5">Activo</Badge>
                  <div>
                    <h4 className="font-medium">Información de Viajes</h4>
                    <p className="text-sm text-gray-600">
                      Fechas reales de próximos viajes y destinos disponibles
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-green-100 text-green-800 mt-0.5">Activo</Badge>
                  <div>
                    <h4 className="font-medium">Tarifas y Servicios</h4>
                    <p className="text-sm text-gray-600">
                      Información actualizada de precios y servicios disponibles
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-blue-100 text-blue-800 mt-0.5">Verificado</Badge>
                  <div>
                    <h4 className="font-medium">Verificación de Respuestas</h4>
                    <p className="text-sm text-gray-600">
                      Sistema de 2 pasos que valida calidad antes de enviar
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-purple-100 text-purple-800 mt-0.5">IA</Badge>
                  <div>
                    <h4 className="font-medium">Aprendizaje Contextual</h4>
                    <p className="text-sm text-gray-600">
                      Mejora respuestas basado en historial del cliente
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Badge className="bg-orange-100 text-orange-800 mt-0.5">Automático</Badge>
                  <div>
                    <h4 className="font-medium">Entrega a Domicilio</h4>
                    <p className="text-sm text-gray-600">
                      Derivación automática a coordinación con Josefa
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Información Técnica */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Información Técnica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Modelo de IA</h4>
                <p className="text-sm text-gray-600 mb-2">GPT-4.1-2025-04-14</p>
                <p className="text-xs text-gray-500">
                  Modelo optimizado para respuestas precisas y verificación
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Sistema de Verificación</h4>
                <p className="text-sm text-gray-600 mb-2">Doble validación automática</p>
                <p className="text-xs text-gray-500">
                  Cada respuesta es verificada por precisión y calidad
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Contexto de Negocio</h4>
                <p className="text-sm text-gray-600 mb-2">Datos en tiempo real</p>
                <p className="text-xs text-gray-500">
                  Acceso a información actualizada de encomiendas y viajes
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Tiempo de Respuesta</h4>
                <p className="text-sm text-gray-600 mb-2">2-5 segundos promedio</p>
                <p className="text-xs text-gray-500">
                  Incluye tiempo de verificación y validación
                </p>
              </div>
            </div>
          </div>

          {/* Mejoras Implementadas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Mejoras Recientes</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Sistema de Verificación Implementado</h4>
                  <p className="text-sm text-green-700">
                    Ahora cada respuesta pasa por un proceso de verificación de calidad antes de ser enviada
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Brain className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Respuestas Contextuales Mejoradas</h4>
                  <p className="text-sm text-blue-700">
                    El bot ahora puede manejar consultas múltiples e integradas de manera más inteligente
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Detección Avanzada de Intenciones</h4>
                  <p className="text-sm text-purple-700">
                    Mejor reconocimiento de consultas sobre fechas, tarifas y estados de encomiendas
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
