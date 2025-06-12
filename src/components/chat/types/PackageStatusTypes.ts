
export type PackageStatus = 
  | 'in_transit'        // En tránsito (Azul)
  | 'pending_delivery'  // Pendiente de entrega (Amarillo/Naranja) 
  | 'delivered'         // Entregado - OK (Verde)
  | 'pending_pickup_payment' // Pendiente recogida + pago (Rojo)
  | 'delivered_pending_payment' // Entregado + pendiente pago (Naranja)
  | 'received_processed' // Recibido/Procesado (Amarillo)
  | 'dispatched';       // Despachado (Morado)

export interface PackageIndicator {
  status: PackageStatus;
  priority: number;
  color: string;
  label: string;
  description: string;
}

export const PACKAGE_STATUS_CONFIG: Record<PackageStatus, PackageIndicator> = {
  pending_pickup_payment: {
    status: 'pending_pickup_payment',
    priority: 1, // Máxima prioridad
    color: 'bg-red-500',
    label: 'Crítico',
    description: 'Pendiente de recogida y pago'
  },
  delivered_pending_payment: {
    status: 'delivered_pending_payment',
    priority: 2,
    color: 'bg-orange-500',
    label: 'Pendiente pago',
    description: 'Entregado - Pendiente de pago'
  },
  pending_delivery: {
    status: 'pending_delivery',
    priority: 3,
    color: 'bg-orange-400',
    label: 'Por entregar',
    description: 'Pendiente de entrega'
  },
  dispatched: {
    status: 'dispatched',
    priority: 4,
    color: 'bg-purple-500',
    label: 'Despachado',
    description: 'Paquete despachado'
  },
  in_transit: {
    status: 'in_transit',
    priority: 5,
    color: 'bg-blue-500',
    label: 'En tránsito',
    description: 'Paquete en camino'
  },
  received_processed: {
    status: 'received_processed',
    priority: 6,
    color: 'bg-yellow-500',
    label: 'Recibido/Procesado',
    description: 'Paquete recibido o procesado'
  },
  delivered: {
    status: 'delivered',
    priority: 7, // Menor prioridad
    color: 'bg-green-500',
    label: 'Entregado',
    description: 'Entregado y pago total'
  }
};
