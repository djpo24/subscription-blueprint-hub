
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Settings, Phone, MessageSquare, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

interface AdminEscalation {
  id: string;
  customer_name: string;
  customer_phone: string;
  original_question: string;
  admin_response: string | null;
  status: 'pending' | 'answered' | 'closed';
  created_at: string;
  answered_at: string | null;
}

export function EscalationControlPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: userRole, isLoading: roleLoading } = useCurrentUserRole();
  const [adminPhone, setAdminPhone] = useState('');

  // Verificar permisos con loading state
  if (roleLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            Verificando permisos...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userRole?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">
            No tienes permisos para acceder a este panel
          </div>
        </CardContent>
      </Card>
    );
  }

  // Obtener configuración actual del administrador
  const { data: adminConfig, isLoading: configLoading } = useQuery({
    queryKey: ['admin-escalation-config'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.rpc('get_app_secret', { 
          secret_name: 'ADMIN_ESCALATION_PHONE' 
        });
        
        if (error) {
          console.error('Error obteniendo configuración:', error);
          return '+573014940399'; // Valor por defecto
        }
        
        return data || '+573014940399';
      } catch (error) {
        console.error('Error en queryFn:', error);
        return '+573014940399';
      }
    },
    enabled: userRole?.role === 'admin'
  });

  // Obtener escalaciones pendientes
  const { data: escalations, isLoading: escalationsLoading } = useQuery({
    queryKey: ['admin-escalations'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('admin_escalations')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as AdminEscalation[];
      } catch (error) {
        console.error('Error obteniendo escalaciones:', error);
        return [];
      }
    },
    enabled: userRole?.role === 'admin'
  });

  // Actualizar estado local cuando se carga la configuración
  useEffect(() => {
    if (adminConfig) {
      setAdminPhone(adminConfig);
    }
  }, [adminConfig]);

  // Mutación para actualizar número de administrador
  const updateAdminPhoneMutation = useMutation({
    mutationFn: async (newPhone: string) => {
      const { data, error } = await supabase.rpc('update_app_secret', {
        secret_name: 'ADMIN_ESCALATION_PHONE',
        secret_value: newPhone
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-escalation-config'] });
      toast({
        title: "Configuración actualizada",
        description: "El número del administrador se ha actualizado correctamente",
      });
    },
    onError: (error: any) => {
      console.error('Error actualizando configuración:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
    }
  });

  // Mutación para marcar escalación como cerrada
  const closeEscalationMutation = useMutation({
    mutationFn: async (escalationId: string) => {
      const { error } = await supabase
        .from('admin_escalations')
        .update({ status: 'closed' })
        .eq('id', escalationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-escalations'] });
      toast({
        title: "Escalación cerrada",
        description: "La escalación se ha marcado como cerrada",
      });
    },
    onError: (error: any) => {
      console.error('Error cerrando escalación:', error);
      toast({
        title: "Error",
        description: "No se pudo cerrar la escalación",
        variant: "destructive"
      });
    }
  });

  const handleUpdateAdminPhone = () => {
    if (!adminPhone.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número válido",
        variant: "destructive"
      });
      return;
    }
    updateAdminPhoneMutation.mutate(adminPhone);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Pendiente
        </Badge>;
      case 'answered':
        return <Badge variant="default" className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          Respondida
        </Badge>;
      case 'closed':
        return <Badge variant="secondary" className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Cerrada
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (configLoading || escalationsLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-gray-500">Cargando panel de control...</div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = escalations?.filter(e => e.status === 'pending').length || 0;
  const answeredCount = escalations?.filter(e => e.status === 'answered').length || 0;

  return (
    <div className="space-y-6">
      {/* Configuración del Administrador */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Escalaciones
          </CardTitle>
          <CardDescription>
            Gestiona el número del administrador que recibirá las escalaciones del chat
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Número del Administrador
            </Label>
            <div className="flex gap-2">
              <Input
                id="admin-phone"
                type="tel"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="+57301234567"
                className="flex-1"
              />
              <Button 
                onClick={handleUpdateAdminPhone}
                disabled={updateAdminPhoneMutation.isPending}
              >
                {updateAdminPhoneMutation.isPending ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Este número recibirá notificaciones cuando SARA no pueda responder una consulta
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{pendingCount}</p>
                <p className="text-sm text-gray-500">Pendientes</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{answeredCount}</p>
                <p className="text-sm text-gray-500">Respondidas</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{escalations?.length || 0}</p>
                <p className="text-sm text-gray-500">Total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Escalaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Escalaciones</CardTitle>
          <CardDescription>
            Escalaciones recientes del sistema de chat automatizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!escalations || escalations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay escalaciones registradas
            </div>
          ) : (
            <div className="space-y-4">
              {escalations.map((escalation) => (
                <div key={escalation.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{escalation.customer_name}</span>
                        {getStatusBadge(escalation.status)}
                      </div>
                      <p className="text-sm text-gray-500">{escalation.customer_phone}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(escalation.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    {escalation.status === 'answered' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeEscalationMutation.mutate(escalation.id)}
                        disabled={closeEscalationMutation.isPending}
                      >
                        Cerrar
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs font-medium text-gray-500">PREGUNTA ORIGINAL:</Label>
                      <p className="text-sm mt-1 p-2 bg-gray-50 rounded border">
                        {escalation.original_question}
                      </p>
                    </div>
                    
                    {escalation.admin_response && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-xs font-medium text-gray-500">RESPUESTA DEL ADMIN:</Label>
                          <p className="text-sm mt-1 p-2 bg-blue-50 rounded border">
                            {escalation.admin_response}
                          </p>
                          {escalation.answered_at && (
                            <p className="text-xs text-gray-500 mt-1">
                              Respondida: {new Date(escalation.answered_at).toLocaleString('es-ES')}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Funcionamiento del Sistema</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Cuando SARA no puede responder una consulta, se crea una escalación automática</li>
          <li>• El administrador configurado recibe una notificación por WhatsApp</li>
          <li>• Al responder el mensaje, la respuesta se envía automáticamente al cliente</li>
          <li>• Las escalaciones se marcan como "respondidas" y pueden cerrarse manualmente</li>
        </ul>
      </div>
    </div>
  );
}
