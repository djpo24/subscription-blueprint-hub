
import { CustomerInfo } from './types.ts';

// Servicio para entender el flujo completo de encomiendas
export class PackageFlowService {
  
  // Estados de paquetes y su significado
  static getPackageStatusExplanation(status: string): string {
    const statusMap: Record<string, string> = {
      'recibido': 'Paquete recibido en origen, esperando ser procesado',
      'procesado': 'Paquete procesado y listo para viajar',
      'en_transito': 'Paquete en el avión, viajando hacia el destino',
      'en_destino': 'Paquete llegó al destino, listo para recoger',
      'entregado': 'Paquete entregado al destinatario'
    };
    return statusMap[status] || 'Estado desconocido';
  }

  // Estados de viajes y su significado
  static getTripStatusExplanation(status: string): string {
    const statusMap: Record<string, string> = {
      'scheduled': 'Viaje programado, aún no ha salido',
      'pending': 'Viaje pendiente de confirmación',
      'in_transit': 'Viaje en curso, avión en el aire',
      'arrived': 'Viaje completado, avión llegó al destino',
      'cancelled': 'Viaje cancelado'
    };
    return statusMap[status] || 'Estado desconocido';
  }

  // Interpretar el estado real de un paquete basado en su estado y el estado del viaje
  static interpretPackageRealStatus(
    packageStatus: string, 
    tripStatus: string | null, 
    tripDate: string | null
  ): {
    realStatus: string;
    description: string;
    timeContext: string;
  } {
    console.log(`🔍 [PackageFlow] Interpretando estado real: paquete=${packageStatus}, viaje=${tripStatus}, fecha=${tripDate}`);

    // Si no hay viaje asignado
    if (!tripStatus || !tripDate) {
      return {
        realStatus: packageStatus,
        description: 'Sin viaje asignado aún',
        timeContext: 'pendiente_asignacion'
      };
    }

    const tripDateObj = new Date(tripDate + 'T00:00:00');
    const now = new Date();
    const isTrip Passed = tripDateObj < now;

    // Lógica según estado del paquete y viaje
    switch (packageStatus) {
      case 'recibido':
        if (tripStatus === 'scheduled' && !isTripPassed) {
          return {
            realStatus: 'esperando_viaje',
            description: 'Paquete recibido, esperando el viaje programado',
            timeContext: 'futuro'
          };
        } else if (tripStatus === 'scheduled' && isTripPassed) {
          return {
            realStatus: 'viaje_perdido',
            description: 'El viaje programado ya pasó, necesita ser reasignado',
            timeContext: 'pasado'
          };
        }
        break;

      case 'procesado':
        if (tripStatus === 'scheduled' && !isTripPassed) {
          return {
            realStatus: 'listo_para_viajar',
            description: 'Paquete procesado y listo para el viaje programado',
            timeContext: 'futuro'
          };
        } else if (tripStatus === 'in_transit') {
          return {
            realStatus: 'viajando',
            description: 'Paquete en el avión, viajando hacia el destino',
            timeContext: 'presente'
          };
        } else if (tripStatus === 'arrived') {
          return {
            realStatus: 'debe_estar_en_destino',
            description: 'El viaje llegó, el paquete debería estar en destino',
            timeContext: 'presente'
          };
        }
        break;

      case 'en_transito':
        if (tripStatus === 'in_transit') {
          return {
            realStatus: 'viajando_confirmado',
            description: 'Paquete confirmado en el avión',
            timeContext: 'presente'
          };
        } else if (tripStatus === 'arrived') {
          return {
            realStatus: 'recien_llegado',
            description: 'Paquete recién llegó al destino',
            timeContext: 'presente'
          };
        }
        break;

      case 'en_destino':
        return {
          realStatus: 'listo_para_recoger',
          description: 'Paquete en destino, listo para recoger',
          timeContext: 'presente'
        };

      case 'entregado':
        return {
          realStatus: 'completado',
          description: 'Proceso completado, paquete entregado',
          timeContext: 'completado'
        };
    }

    // Estado por defecto
    return {
      realStatus: packageStatus,
      description: this.getPackageStatusExplanation(packageStatus),
      timeContext: 'incierto'
    };
  }

  // Generar respuesta contextual basada en el estado real
  static generateContextualResponse(
    customerInfo: CustomerInfo,
    message: string,
    packageDetails: any
  ): string | null {
    
    if (!packageDetails || !customerInfo.customerFound) {
      return null;
    }

    const customerName = customerInfo.customerFirstName || 'Cliente';
    const pkg = packageDetails;
    
    // Interpretar el estado real del paquete
    const realStatus = this.interpretPackageRealStatus(
      pkg.status,
      pkg.trip?.status,
      pkg.trip?.trip_date
    );

    console.log(`🎯 [PackageFlow] Estado real interpretado:`, realStatus);

    // Detectar tipo de pregunta
    const isArrivalQuery = /ya.*llegó|llegó.*encomienda|está.*lista|puedo.*recoger/i.test(message);
    const isTimeQuery = /qué.*hora|a.*hora|cuándo/i.test(message);
    const isStatusQuery = /estado|cómo.*está|dónde.*está/i.test(message);

    // Responder según el estado real y la pregunta
    if (isArrivalQuery) {
      switch (realStatus.realStatus) {
        case 'listo_para_recoger':
          return `¡Hola ${customerName}! 👋

Sí, tu encomienda **${pkg.tracking_number}** ya llegó a ${pkg.destination}. ✅

📦 **Está lista para recoger.**`;

        case 'recien_llegado':
          return `¡Hola ${customerName}! 👋

Sí, tu encomienda **${pkg.tracking_number}** acaba de llegar a ${pkg.destination}. ✅

📦 **Está siendo procesada para entrega.**`;

        case 'viajando_confirmado':
        case 'viajando':
          return `¡Hola ${customerName}! 👋

No, tu encomienda **${pkg.tracking_number}** está viajando hacia ${pkg.destination}. 🛫

⏰ **Te avisamos cuando llegue.**`;

        case 'listo_para_viajar':
        case 'esperando_viaje':
          return `¡Hola ${customerName}! 👋

No, tu encomienda **${pkg.tracking_number}** aún no ha salido hacia ${pkg.destination}. 📦

🛫 **Está programada para viajar próximamente.**`;

        default:
          return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está siendo procesada. 📦

⏰ **Te mantenemos informado del progreso.**`;
      }
    }

    if (isTimeQuery) {
      switch (realStatus.realStatus) {
        case 'listo_para_recoger':
        case 'recien_llegado':
          return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** ya está en ${pkg.destination}. ✅

📦 **Disponible para recoger ahora.**`;

        case 'viajando_confirmado':
        case 'viajando':
          return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está en tránsito. 🛫

⏰ **Llegará cuando el vuelo aterrice en ${pkg.destination}.**`;

        case 'listo_para_viajar':
          if (pkg.trip?.trip_date) {
            const tripDate = new Date(pkg.trip.trip_date + 'T00:00:00');
            const formattedDate = tripDate.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            });
            const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            
            return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está programada para viajar el **${capitalizedDate}**. 🛫

📦 **Sale de ${pkg.origin} hacia ${pkg.destination}.**`;
          }
          break;

        case 'esperando_viaje':
          return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}** está esperando ser asignada a un viaje. 📦

⏰ **Te informamos la fecha cuando esté confirmada.**`;
      }
    }

    if (isStatusQuery) {
      return `¡Hola ${customerName}! 👋

Tu encomienda **${pkg.tracking_number}**: ${realStatus.description}. 📦

📍 **Ruta:** ${pkg.origin} → ${pkg.destination}`;
    }

    return null;
  }

  // Validar coherencia entre estados
  static validatePackageStatus(packageData: any): {
    isConsistent: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    if (packageData.status === 'en_destino' && packageData.trip?.status === 'scheduled') {
      issues.push('Paquete marcado como en destino pero el viaje aún no ha salido');
      suggestions.push('Verificar el estado real del viaje o del paquete');
    }

    if (packageData.status === 'recibido' && packageData.trip?.status === 'arrived') {
      issues.push('Viaje llegó pero el paquete sigue marcado como recibido');
      suggestions.push('Actualizar el estado del paquete a en_destino');
    }

    const tripDate = new Date(packageData.trip?.trip_date + 'T00:00:00');
    const now = new Date();
    
    if (tripDate < now && packageData.trip?.status === 'scheduled') {
      issues.push('Fecha de viaje ya pasó pero sigue marcado como programado');
      suggestions.push('Actualizar el estado del viaje o reasignar paquete');
    }

    return {
      isConsistent: issues.length === 0,
      issues,
      suggestions
    };
  }
}
