
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Edit, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import type { DestinationAddress } from '@/types/supabase-temp';

export function DestinationAddressesManager() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch destination addresses
  const { data: addresses = [], isLoading, error } = useQuery({
    queryKey: ['destination-addresses'],
    queryFn: async (): Promise<DestinationAddress[]> => {
      console.log('🔍 Fetching destination addresses...');
      
      const { data, error } = await supabase
        .from('destination_addresses')
        .select('*')
        .order('city');

      if (error) {
        console.error('❌ Error fetching destination addresses:', error);
        throw error;
      }

      console.log('✅ Destination addresses fetched:', data?.length || 0, 'addresses');
      return (data || []) as DestinationAddress[];
    }
  });

  // Add new address
  const addAddressMutation = useMutation({
    mutationFn: async ({ city, address }: { city: string; address: string }) => {
      console.log('➕ Adding new destination address:', { city, address });
      
      const { error } = await supabase
        .from('destination_addresses')
        .insert({ city, address });

      if (error) {
        console.error('❌ Error adding destination address:', error);
        throw error;
      }
      
      console.log('✅ Destination address added successfully');
    },
    onSuccess: () => {
      toast({
        title: "✅ Dirección agregada",
        description: "La nueva dirección de destino ha sido agregada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['destination-addresses'] });
      setIsAdding(false);
      setEditCity('');
      setEditAddress('');
    },
    onError: (error: any) => {
      console.error('❌ Mutation error adding address:', error);
      toast({
        title: "❌ Error agregando dirección",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update address
  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, city, address }: { id: string; city: string; address: string }) => {
      console.log('✏️ Updating destination address:', { id, city, address });
      
      const { error } = await supabase
        .from('destination_addresses')
        .update({ city, address, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating destination address:', error);
        throw error;
      }
      
      console.log('✅ Destination address updated successfully');
    },
    onSuccess: () => {
      toast({
        title: "✅ Dirección actualizada",
        description: "La dirección ha sido actualizada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['destination-addresses'] });
      setIsEditing(null);
      setEditCity('');
      setEditAddress('');
    },
    onError: (error: any) => {
      console.error('❌ Mutation error updating address:', error);
      toast({
        title: "❌ Error actualizando dirección",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Delete address
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deleting destination address:', id);
      
      const { error } = await supabase
        .from('destination_addresses')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting destination address:', error);
        throw error;
      }
      
      console.log('✅ Destination address deleted successfully');
    },
    onSuccess: () => {
      toast({
        title: "✅ Dirección eliminada",
        description: "La dirección ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['destination-addresses'] });
    },
    onError: (error: any) => {
      console.error('❌ Mutation error deleting address:', error);
      toast({
        title: "❌ Error eliminando dirección",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleEdit = (address: DestinationAddress) => {
    setIsEditing(address.id);
    setEditCity(address.city);
    setEditAddress(address.address);
  };

  const handleSave = () => {
    if (isAdding) {
      addAddressMutation.mutate({ city: editCity, address: editAddress });
    } else if (isEditing) {
      updateAddressMutation.mutate({ id: isEditing, city: editCity, address: editAddress });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setIsEditing(null);
    setEditCity('');
    setEditAddress('');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Direcciones de Destino
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando direcciones...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            Error al cargar direcciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">No se pudieron cargar las direcciones de destino.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-green-50 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <MapPin className="h-5 w-5" />
          Direcciones de Destino
          {addresses.length > 0 && (
            <Badge variant="outline" className="bg-green-100 text-green-700">
              {addresses.length} configuradas
            </Badge>
          )}
        </CardTitle>
        <CardDescription className="text-green-600">
          Administra las direcciones que se incluyen en las notificaciones automáticas de llegada.
          {addresses.length === 0 && " Agrega al menos una dirección para activar las notificaciones automáticas."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status indicator */}
          {addresses.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-green-100 border border-green-200 rounded">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Las notificaciones automáticas están activas con direcciones específicas
              </span>
            </div>
          )}

          {/* Add button */}
          {!isAdding && !isEditing && (
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Nueva Dirección
            </Button>
          )}

          {/* Add/Edit form */}
          {(isAdding || isEditing) && (
            <div className="p-4 bg-white rounded border border-green-200 space-y-3">
              <h4 className="font-medium text-green-800">
                {isAdding ? 'Agregar Nueva Dirección' : 'Editar Dirección'}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <Input
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    placeholder="Ej: Barranquilla"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dirección Específica</label>
                  <Textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ej: Calle 45B # 22 -124, Local 101, Centro Comercial"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Esta dirección aparecerá en las notificaciones de WhatsApp enviadas a los clientes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={!editCity.trim() || !editAddress.trim() || addAddressMutation.isPending || updateAddressMutation.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {addAddressMutation.isPending || updateAddressMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Address list */}
          <div className="space-y-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-3 bg-white rounded border border-green-200 flex items-start justify-between"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {address.city}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{address.address}</p>
                  <p className="text-xs text-gray-500">
                    Actualizada: {new Date(address.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleEdit(address)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    disabled={isAdding || Boolean(isEditing)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => deleteAddressMutation.mutate(address.id)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    disabled={isAdding || Boolean(isEditing) || deleteAddressMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {addresses.length === 0 && !isAdding && (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-orange-300 mb-3" />
              <p className="text-orange-600 font-medium">No hay direcciones configuradas</p>
              <p className="text-orange-500 text-sm">
                Las notificaciones automáticas usarán direcciones genéricas hasta que agregues direcciones específicas
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Agrega direcciones para mejorar la experiencia del cliente con información precisa de ubicación
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
