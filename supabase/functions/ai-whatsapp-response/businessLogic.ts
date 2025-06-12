
import { CustomerInfo } from './types.ts';

export interface TripValidationResult {
  isValid: boolean;
  message: string;
  affectedPackages: string[];
}

export function validatePackageDeliveryTiming(customerInfo: CustomerInfo): TripValidationResult {
  const result: TripValidationResult = {
    isValid: true,
    message: '',
    affectedPackages: []
  };

  if (!customerInfo.customerFound || customerInfo.pendingDeliveryPackages.length === 0) {
    return result;
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Verificar cada encomienda pendiente de entrega
  for (const pkg of customerInfo.pendingDeliveryPackages) {
    // Simular fecha de viaje (esto debería venir de la base de datos de trips)
    // Por ahora verificamos si la encomienda fue creada hace más de 24 horas
    const packageCreatedAt = new Date(pkg.created_at);
    const hoursSinceCreation = (now.getTime() - packageCreatedAt.getTime()) / (1000 * 60 * 60);

    // Si la encomienda tiene más de 24 horas y aún no se ha procesado adecuadamente
    if (hoursSinceCreation > 24 && pkg.status === 'recibido') {
      result.isValid = false;
      result.affectedPackages.push(pkg.tracking_number);
    }
  }

  if (!result.isValid) {
    result.message = `⚠️ Importante: Las siguientes encomiendas necesitan atención inmediata ya que deben procesarse antes del viaje programado:

${result.affectedPackages.map(tracking => `📦 ${tracking}`).join('\n')}

Te recomiendo contactar a nuestro equipo para coordinar el procesamiento urgente.`;
  }

  return result;
}

export function generateBusinessIntelligentResponse(customerInfo: CustomerInfo): string {
  const validation = validatePackageDeliveryTiming(customerInfo);
  
  if (!validation.isValid) {
    return validation.message;
  }

  // Respuesta inteligente basada en el estado actual del cliente
  if (customerInfo.pendingPaymentPackages.length > 0) {
    const totalPending = Object.values(customerInfo.currencyBreakdown).reduce((sum, amount) => sum + amount, 0);
    if (totalPending > 0) {
      return `💡 Nota: Tienes pagos pendientes que puedes realizar cuando gustes. Esto agilizará futuras entregas.`;
    }
  }

  if (customerInfo.pendingDeliveryPackages.length > 0) {
    return `📋 Tienes ${customerInfo.pendingDeliveryPackages.length} encomienda(s) en proceso. Te mantendré informado sobre su progreso.`;
  }

  return '';
}
