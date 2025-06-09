
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface DestinationAddress {
  id: string;
  city: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export function DestinationAddressesManager() {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editCity, setEditCity] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch destination addresses
  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['destination-addresses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('destination_addresses')
        .select('*')
        .order('city');

      if (error) {
        console.error('Error fetching destination addresses:', error);
        throw error;
      }

      return data as DestinationAddress[];
    }
  });

  // Add new address
  const addAddressMutation = useMutation({
    mutationFn: async ({ city, address }: { city: string; address: string }) => {
      const { error } = await supabase
        .from('destination_addresses')
        .insert({ city, address });

      if (error) throw error;
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
      const { error } = await supabase
        .from('destination_addresses')
        .update({ city, address, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
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
      const { error } = await supabase
        .from('destination_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ Dirección eliminada",
        description: "La dirección ha sido eliminada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['destination-addresses'] });
    },
    onError: (error: any) => {
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
          <CardTitle>Direcciones de Destino</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Cargando direcciones...</p>
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
        </CardTitle>
        <CardDescription className="text-green-600">
          Administra las direcciones que se incluyen en las notificaciones de llegada
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
                  <label className="block text-sm font-medium mb-1">Dirección</label>
                  <Textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="Ej: Calle 45B # 22 -124"
                    rows={2}
                  />
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
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700">
                      {address.city}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">{address.address}</p>
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
            <div className="text-center py-6">
              <MapPin className="h-12 w-12 mx-auto text-green-300 mb-3" />
              <p className="text-green-600 font-medium">No hay direcciones configuradas</p>
              <p className="text-green-500 text-sm">
                Agrega direcciones para incluirlas en las notificaciones automáticas
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
