
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

interface SecurityStats {
  totalMessages: number;
  blockedUsers: number;
  suspiciousActivity: number;
  rateLimitHits: number;
}

interface RecentActivity {
  id: string;
  user_id: string;
  activity_type: string;
  details: any;
  created_at: string;
}

export function SecurityDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['security-stats'],
    queryFn: async (): Promise<SecurityStats> => {
      const [messagesResult, blockedResult, suspiciousResult, rateLimitResult] = await Promise.all([
        supabase.from('notification_log').select('id', { count: 'exact' }).eq('notification_type', 'secure_chat'),
        supabase.from('user_chat_status').select('id', { count: 'exact' }).eq('is_blocked', true),
        supabase.from('suspicious_activity').select('id', { count: 'exact' }),
        supabase.from('chat_rate_limit').select('id', { count: 'exact' }).gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalMessages: messagesResult.count || 0,
        blockedUsers: blockedResult.count || 0,
        suspiciousActivity: suspiciousResult.count || 0,
        rateLimitHits: rateLimitResult.count || 0,
      };
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-security-activity'],
    queryFn: async (): Promise<RecentActivity[]> => {
      const { data, error } = await supabase
        .from('suspicious_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000,
  });

  if (statsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando estadísticas de seguridad...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-green-600" />
        <h2 className="text-2xl font-bold">Dashboard de Seguridad del Chat</h2>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensajes Totales</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Mensajes enviados de forma segura</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Bloqueados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.blockedUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios con acceso restringido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actividad Sospechosa</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats?.suspiciousActivity || 0}</div>
            <p className="text-xs text-muted-foreground">Intentos detectados y bloqueados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limits (24h)</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.rateLimitHits || 0}</div>
            <p className="text-xs text-muted-foreground">Límites aplicados hoy</p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Sospechosa Reciente</CardTitle>
          <CardDescription>
            Los últimos 10 eventos de seguridad detectados por el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activityLoading ? (
            <div className="text-center py-4 text-gray-500">Cargando actividad reciente...</div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <div className="text-center py-4 text-green-600">
              ✅ No se ha detectado actividad sospechosa reciente
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="font-medium">
                        {activity.activity_type === 'suspicious_message' ? 'Mensaje Sospechoso' : activity.activity_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        Usuario: {activity.user_id}
                      </p>
                      {activity.details?.suspiciousScore && (
                        <p className="text-xs text-orange-600">
                          Puntuación de riesgo: {activity.details.suspiciousScore}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="mb-1">
                      {activity.activity_type}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
