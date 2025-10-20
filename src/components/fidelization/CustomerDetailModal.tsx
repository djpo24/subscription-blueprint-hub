import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCustomerHistory } from '@/hooks/useCustomerHistory';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FidelizationCustomer } from '@/hooks/useFidelizationData';
import { Trophy, Package, Calendar, MapPin, Hash, Weight, DollarSign, Gift } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomerDetailModalProps {
  customer: FidelizationCustomer | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CustomerDetailModal({ customer, isOpen, onClose }: CustomerDetailModalProps) {
  const [activeTab, setActiveTab] = useState('shipments');
  const { data: shipments = [], isLoading } = useCustomerHistory(customer?.id || null);

  // Fetch redemptions
  const { data: redemptions = [], isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ['customer-redemptions', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];

      const { data, error } = await supabase
        .from('point_redemptions')
        .select(`
          *,
          packages (
            tracking_number,
            description,
            amount_to_collect,
            discount_applied,
            currency
          )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!customer?.id && isOpen,
  });

  if (!customer) return null;

  const totalHistoricalPoints = shipments.reduce((sum, shipment) => sum + shipment.totalPoints, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Historial de Fidelización - {customer.name}
          </DialogTitle>
        </DialogHeader>

        {/* Customer Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{customer.position}°</div>
            <div className="text-sm text-muted-foreground">Posición</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{customer.totalShipments}</div>
            <div className="text-sm text-muted-foreground">Envíos Totales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{customer.bestStreak}</div>
            <div className="text-sm text-muted-foreground">Mejor Racha</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{customer.totalPoints}</div>
            <div className="text-sm text-muted-foreground">Puntos Actuales</div>
          </div>
        </div>

        <Separator />

        {/* Points Explanation */}
         <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
           <h3 className="font-semibold mb-2 flex items-center gap-2">
             <Trophy className="h-4 w-4" />
             Sistema de Puntos
           </h3>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• <strong>50 puntos</strong> por cada envío realizado</p>
              <p>• <strong>10 puntos adicionales</strong> por cada kilo enviado</p>
              <p className="font-medium text-orange-600">⚠️ Solo se otorgan puntos cuando el envío está entregado, pagado Y forma parte de un viaje programado</p>
              <p className="font-medium">Ejemplo: Un envío de 5kg entregado y pagado en un viaje = 50 + (5 × 10) = 100 puntos</p>
            </div>
         </div>

        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shipments">Envíos</TabsTrigger>
            <TabsTrigger value="redemptions">Redenciones</TabsTrigger>
          </TabsList>

          <TabsContent value="shipments" className="mt-4">
        {/* Shipments History */}
        <div>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package className="h-4 w-4" />
            Historial de Envíos ({shipments.length})
          </h3>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : shipments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay envíos registrados para este cliente</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Fecha</TableHead>
                    <TableHead>Tracking</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-center">Peso</TableHead>
                    <TableHead>Ruta</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Pago</TableHead>
                    <TableHead className="text-right">Puntos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(shipment.created_at), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          <span className="font-mono text-sm">
                            {shipment.tracking_number || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {shipment.description || 'Sin descripción'}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Weight className="h-3 w-3" />
                          <Badge variant="outline" className="font-mono">
                            {shipment.weight || 0} kg
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-32">
                            {shipment.origin || 'N/A'} → {shipment.destination || 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={
                            shipment.status === 'delivered' ? 'default' :
                            shipment.status === 'in_transit' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {shipment.status === 'delivered' ? 'Entregado' :
                           shipment.status === 'in_transit' ? 'En tránsito' :
                           shipment.status === 'pending' ? 'Pendiente' : 
                           shipment.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {shipment.payment ? (
                            <div className="text-sm">
                              <div className="font-semibold">
                                {shipment.payment.currency === 'COP' ? '$' : 
                                 shipment.payment.currency === 'AWG' ? 'ƒ' : ''}
                                {shipment.payment.amount.toLocaleString()}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {shipment.payment.currency}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              Sin pago
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="space-y-1">
                          {shipment.totalPoints > 0 ? (
                            <>
                              <div className="font-bold text-green-600">
                                {shipment.totalPoints} pts
                              </div>
                              <div className="text-xs text-muted-foreground">
                                50 + ({shipment.weight || 0} × 10)
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="font-bold text-gray-400">
                                0 pts
                              </div>
                              <div className="text-xs text-red-500">
                                No entregado, sin pago o sin viaje
                              </div>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {shipments.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Resumen de Puntos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Puntos base:</span>
                    <div className="font-bold">{shipments.length} × 50 = {shipments.length * 50} pts</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Puntos por peso:</span>
                    <div className="font-bold">
                      {shipments.reduce((sum, s) => sum + s.weightPoints, 0)} pts
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total histórico:</span>
                    <div className="font-bold text-green-600">{totalHistoricalPoints} pts</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
          </TabsContent>

          <TabsContent value="redemptions" className="mt-4">
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Historial de Redenciones ({redemptions.length})
              </h3>

              {isLoadingRedemptions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : redemptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay redenciones registradas para este cliente</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead className="text-center">Puntos</TableHead>
                        <TableHead className="text-center">Kilos</TableHead>
                        <TableHead>Paquete</TableHead>
                        <TableHead className="text-center">Precio/Kilo</TableHead>
                        <TableHead className="text-center">Descuento</TableHead>
                        <TableHead className="text-center">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {redemptions.map((redemption) => (
                        <TableRow key={redemption.id}>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(redemption.created_at), 'dd/MM/yyyy HH:mm', { locale: es })}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className="font-mono">
                              {redemption.points_redeemed.toLocaleString()} pts
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Weight className="h-3 w-3" />
                              <span className="font-semibold">{redemption.kilos_earned} kg</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {redemption.packages ? (
                              <div className="text-sm">
                                <div className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  <span className="font-mono text-xs">
                                    {redemption.packages.tracking_number}
                                  </span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate max-w-48">
                                  {redemption.packages.description || 'Sin descripción'}
                                </div>
                              </div>
                            ) : (
                              <Badge variant="outline" className="text-xs">Sin paquete</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {redemption.price_per_kilo ? (
                              <span className="font-mono text-sm">
                                ƒ{Number(redemption.price_per_kilo).toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {redemption.discount_amount ? (
                              <div className="text-sm">
                                <div className="font-bold text-green-600">
                                  -ƒ{Number(redemption.discount_amount).toFixed(2)}
                                </div>
                                {redemption.packages && (
                                  <div className="text-xs text-muted-foreground">
                                    de ƒ{redemption.packages.amount_to_collect.toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={
                                redemption.status === 'verified' ? 'default' :
                                redemption.status === 'pending' ? 'secondary' :
                                redemption.status === 'expired' ? 'destructive' : 'outline'
                              }
                              className="text-xs"
                            >
                              {redemption.status === 'verified' ? '✓ Verificado' :
                               redemption.status === 'pending' ? '⏳ Pendiente' :
                               redemption.status === 'expired' ? '✗ Expirado' : 
                               redemption.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}