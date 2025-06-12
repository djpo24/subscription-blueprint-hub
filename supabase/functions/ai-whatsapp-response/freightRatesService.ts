
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface FreightRate {
  id: string;
  origin: string;
  destination: string;
  price_per_kilo: number;
  currency: string;
  effective_from: string;
  effective_until?: string;
  notes?: string;
  is_active: boolean;
}

export async function getActiveFreightRates(supabase: any): Promise<FreightRate[]> {
  console.log('🚚 [FreightRates] Obteniendo tarifas de flete activas...');
  
  const { data: rates, error } = await supabase
    .from('route_freight_rates')
    .select('*')
    .eq('is_active', true)
    .lte('effective_from', new Date().toISOString().split('T')[0])
    .or('effective_until.is.null,effective_until.gte.' + new Date().toISOString().split('T')[0])
    .order('origin', { ascending: true })
    .order('destination', { ascending: true })
    .order('effective_from', { ascending: false });

  if (error) {
    console.error('❌ [FreightRates] Error obteniendo tarifas:', error);
    return [];
  }

  console.log(`✅ [FreightRates] Encontradas ${rates?.length || 0} tarifas activas`);
  return rates || [];
}

export function formatFreightRateForPrompt(rates: FreightRate[]): string {
  if (!rates || rates.length === 0) {
    return 'No hay tarifas de flete configuradas en el sistema.';
  }

  let ratesText = 'TARIFAS DE FLETE VIGENTES (por kilogramo):\n';
  
  rates.forEach(rate => {
    const currencySymbol = rate.currency === 'COP' ? '$' : 
                          rate.currency === 'AWG' ? 'ƒ' : rate.currency;
    const currencyName = rate.currency === 'COP' ? 'pesos' : 
                        rate.currency === 'AWG' ? 'florines' : rate.currency;
    
    ratesText += `- ${rate.origin} → ${rate.destination}: ${currencySymbol}${rate.price_per_kilo} ${currencyName}/kg\n`;
    
    if (rate.notes) {
      ratesText += `  Nota: ${rate.notes}\n`;
    }
  });

  ratesText += `
INSTRUCCIONES PARA CONSULTAS DE TARIFAS:
- Si el cliente pregunta sobre precios o tarifas, SIEMPRE pregunta primero por el destino
- Las rutas disponibles son: Barranquilla ↔ Curazao
- Proporciona la tarifa exacta según la ruta solicitada
- Explica que los precios son por kilogramo
- Menciona que pueden variar según el peso total del envío`;

  return ratesText;
}
