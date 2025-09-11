
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIInteractions } from '@/hooks/useAIFeedback';
import { Brain, Clock, MessageSquare, TrendingUp, AlertTriangle } from 'lucide-react';

export function AIAnalytics() {
  const { data: interactions = [], isLoading } = useAIInteractions(100);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalInteractions = interactions.length;
  const fallbackCount = interactions.filter(i => i.was_fallback).length;
  const fallbackRate = totalInteractions > 0 ? (fallbackCount / totalInteractions) * 100 : 0;
  
  const avgResponseTime = totalInteractions > 0 
    ? interactions.reduce((acc, i) => acc + i.response_time_ms, 0) / totalInteractions 
    : 0;

  const recentInteractions = interactions.slice(0, 24); // Last 24 interactions
  const recentFallbackRate = recentInteractions.length > 0 
    ? (recentInteractions.filter(i => i.was_fallback).length / recentInteractions.length) * 100 
    : 0;

  // Get interactions with context
  const interactionsWithContext = interactions.filter(i => 
    i.context_info?.customerFound || i.context_info?.packagesCount > 0
  ).length;
  
  const contextRate = totalInteractions > 0 
    ? (interactionsWithContext / totalInteractions) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interacciones</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInteractions}</div>
            <p className="text-xs text-muted-foreground">
              Conversaciones procesadas por IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Respuesta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgResponseTime)}ms</div>
            <p className="text-xs text-muted-foreground">
              Promedio de respuesta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Contexto</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(contextRate)}%</div>
            <p className="text-xs text-muted-foreground">
              Respuestas con información del cliente
            </p>
            <Progress value={contextRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Respuestas Fallback</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{Math.round(recentFallbackRate)}%</div>
              <Badge variant={recentFallbackRate > 20 ? "destructive" : "secondary"}>
                {recentFallbackRate > fallbackRate ? "↑" : "↓"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Últimas 24 interacciones
            </p>
            <Progress 
              value={recentFallbackRate} 
              className="mt-2"
              indicatorClassName={recentFallbackRate > 20 ? "bg-red-500" : "bg-green-500"}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Análisis de Rendimiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {Math.round(100 - fallbackRate)}%
                </div>
                <div className="text-sm text-green-600">Éxito General</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {interactionsWithContext}
                </div>
                <div className="text-sm text-blue-600">Con Información</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">
                  {totalInteractions - fallbackCount}
                </div>
                <div className="text-sm text-purple-600">Respuestas IA</div>
              </div>
            </div>

            {fallbackRate > 30 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Alta tasa de fallback detectada</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  La tasa de respuestas fallback es del {Math.round(fallbackRate)}%. 
                  Considera revisar la configuración de OpenAI o verificar los límites de rate.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
