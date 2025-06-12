
import { CustomerInfo } from './types.ts';

export interface BusinessValidationResult {
  isValid: boolean;
  message: string;
  affectedPackages: string[];
}

export function validatePackageDeliveryTiming(customerInfo: CustomerInfo): BusinessValidationResult {
  const result: BusinessValidationResult = {
    isValid: true,
    message: "",
    affectedPackages: []
  };

  if (!customerInfo.customerFound || customerInfo.pendingDeliveryPackages.length === 0) {
    return result;
  }

  // Only validate with REAL data - never assume dates
  const currentDate = new Date();
  const problematicPackages: string[] = [];

  customerInfo.pendingDeliveryPackages.forEach(pkg => {
    if (pkg.created_at) {
      const createdDate = new Date(pkg.created_at);
      const hoursSinceCreation = (currentDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
      
      // Only flag if we have REAL data showing a potential issue
      if (hoursSinceCreation > 48) { // More than 48 hours old
        problematicPackages.push(pkg.tracking_number);
      }
    }
  });

  if (problematicPackages.length > 0) {
    result.isValid = false;
    result.message = `⚠️ NOTA: Tengo registradas algunas encomiendas con más tiempo en sistema. Nuestro equipo verificará el estado actualizado.`;
    result.affectedPackages = problematicPackages;
  }

  return result;
}

export function generateBusinessIntelligentResponse(customerInfo: CustomerInfo): string | null {
  if (!customerInfo.customerFound) {
    return "CLIENTE NO IDENTIFICADO: Requiere verificación manual del equipo.";
  }

  const insights: string[] = [];

  // Only add insights based on REAL data
  if (customerInfo.pendingPaymentPackages.length > 0) {
    const totalPending = Object.values(customerInfo.currencyBreakdown).reduce((sum, amount) => sum + amount, 0);
    if (totalPending > 0) {
      insights.push(`SALDO VERIFICADO: ${totalPending} pendiente de cobro según sistema`);
    }
  }

  if (customerInfo.pendingDeliveryPackages.length > 0) {
    insights.push(`ENCOMIENDAS EN TRÁNSITO: ${customerInfo.pendingDeliveryPackages.length} registradas en sistema`);
  }

  if (customerInfo.packagesCount > 10) {
    insights.push(`CLIENTE FRECUENTE: ${customerInfo.packagesCount} encomiendas históricas registradas`);
  }

  return insights.length > 0 ? insights.join(" | ") : null;
}
