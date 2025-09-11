
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface DestinationAddress {
  id: string;
  city: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export async function getDestinationAddresses(supabase: any): Promise<DestinationAddress[]> {
  console.log('🏢 [DestinationAddresses] Obteniendo direcciones de destino configuradas...');
  
  try {
    const { data: addresses, error } = await supabase
      .from('destination_addresses')
      .select('id, city, address, created_at, updated_at')
      .order('city');

    if (error) {
      console.error('❌ [DestinationAddresses] Error obteniendo direcciones:', error);
      return [];
    }

    console.log(`✅ [DestinationAddresses] Encontradas ${addresses?.length || 0} direcciones configuradas`);
    return addresses || [];
  } catch (error) {
    console.error('❌ [DestinationAddresses] Error en servicio:', error);
    return [];
  }
}

export function formatAddressesForPrompt(addresses: DestinationAddress[]): string {
  if (!addresses || addresses.length === 0) {
    return `
DIRECCIONES DE RECOGIDA: NO HAY DIRECCIONES CONFIGURADAS EN EL SISTEMA

IMPORTANTE: No hay direcciones específicas configuradas. En este caso, NUNCA inventar direcciones.
Responder: "No tengo las direcciones específicas de recogida configuradas en el sistema. Un miembro de nuestro equipo le proporcionará la dirección exacta pronto."`;
  }

  let addressContext = `
DIRECCIONES REALES DE RECOGIDA CONFIGURADAS EN EL SISTEMA:

`;

  addresses.forEach((address, index) => {
    addressContext += `${index + 1}. ${address.city.toUpperCase()}:
   📍 Dirección exacta: ${address.address}
   
`;
  });

  addressContext += `
INSTRUCCIONES CRÍTICAS PARA RESPONDER SOBRE DIRECCIONES DE RECOGIDA:

🔍 ANÁLISIS OBLIGATORIO ANTES DE RESPONDER:
1. Verificar el destino de la(s) encomienda(s) del cliente en los datos reales
2. Analizar si el cliente tiene encomiendas en uno o múltiples destinos
3. Responder SOLO con direcciones reales configuradas arriba

📋 LÓGICA DE RESPUESTA:
- Si la encomienda está en Curazao: Usar dirección de Curazao configurada arriba
- Si la encomienda está en Barranquilla: Usar dirección de Barranquilla configurada arriba
- Si tiene encomiendas en AMBOS destinos: Preguntar "¿Para cuál destino necesita la dirección de recogida?"
- Si no hay encomiendas o destino no claro: Pedir número de tracking para verificar

❌ PROHIBIDO ABSOLUTAMENTE:
- Inventar direcciones que no estén en la lista de arriba
- Usar direcciones genéricas o aproximadas
- Mencionar direcciones que no están configuradas en el sistema
- Dar información de ubicación sin verificar el destino de la encomienda

✅ RESPUESTA CORRECTA EJEMPLO:
"Su encomienda se encuentra en [DESTINO REAL]. Puede recogerla en:
📍 [DIRECCIÓN EXACTA CONFIGURADA]
[Horarios si es relevante]"

REGLA DE ORO: SOLO usar las direcciones EXACTAS listadas arriba. NUNCA inventar.`;

  return addressContext;
}

export function analyzeCustomerDestinations(customerInfo: any): {
  hasBarranquilla: boolean;
  hasCurazao: boolean;
  destinationCount: number;
  destinations: string[];
} {
  const destinations = new Set<string>();
  
  // Analizar encomiendas pendientes de entrega
  if (customerInfo.pendingDeliveryPackages) {
    customerInfo.pendingDeliveryPackages.forEach((pkg: any) => {
      if (pkg.destination) {
        destinations.add(pkg.destination.toLowerCase());
      }
    });
  }
  
  // Analizar encomiendas con pagos pendientes
  if (customerInfo.pendingPaymentPackages) {
    customerInfo.pendingPaymentPackages.forEach((pkg: any) => {
      if (pkg.destination) {
        destinations.add(pkg.destination.toLowerCase());
      }
    });
  }
  
  const destinationArray = Array.from(destinations);
  const hasBarranquilla = destinationArray.some(dest => 
    dest.includes('barranquilla') || dest.includes('colombia')
  );
  const hasCurazao = destinationArray.some(dest => 
    dest.includes('curazao') || dest.includes('curaçao') || dest.includes('curacao')
  );
  
  return {
    hasBarranquilla,
    hasCurazao,
    destinationCount: destinationArray.length,
    destinations: destinationArray
  };
}
