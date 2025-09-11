
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
    return '❌ No hay tarifas de flete configuradas en el sistema.';
  }

  let ratesText = '💰 **TARIFAS DE FLETE VIGENTES PARA ENVÍO DE ENCOMIENDAS** (por kilogramo):\n\n';
  
  rates.forEach(rate => {
    // Formatear usando el nuevo formato específico con emojis
    const formattedPrice = rate.currency === 'AWG' 
      ? `ƒ${rate.price_per_kilo} florines`
      : `$${rate.price_per_kilo.toLocaleString('es-CO')} pesos`;
    
    ratesText += `📦 **Envío ${rate.origin} → ${rate.destination}:** ${formattedPrice}/kg 💰\n`;
    
    if (rate.notes) {
      ratesText += `   📝 Nota: ${rate.notes}\n`;
    }
  });

  ratesText += `
📋 **INSTRUCCIONES PARA CONSULTAS DE TARIFAS DE ENVÍO CON EMOJIS:**

🎯 **PREGUNTAS OBLIGATORIAS:**
- Si el cliente pregunta sobre precios o tarifas, SIEMPRE pregunta: "¿Hacia dónde quieres enviar tu encomienda? 🌎"
- Las rutas disponibles para envío de encomiendas son: 
  • 🇨🇴 Barranquilla → 🇨🇼 Curazao
  • 🇨🇼 Curazao → 🇨🇴 Barranquilla

💰 **INFORMACIÓN DE TARIFAS:**
- Proporciona la tarifa exacta según la ruta de envío solicitada
- Explica que los precios son por kilogramo de encomienda 📦
- Menciona que pueden variar según el peso total del envío ⚖️
- SIEMPRE usa el formato correcto: ƒ[cantidad] florines para AWG y $[cantidad con separadores] pesos para COP
- NUNCA inventes tarifas que no estén en el sistema ❌

🎨 **FORMATO CON EMOJIS:**
- Usar 💰 para precios y tarifas
- Usar 📦 para encomiendas
- Usar 🌎 para destinos
- Usar ⚖️ para peso
- Usar 🚀 para branding: "Envíos Ojito - Conectando Barranquilla y Curazao"`;

  return ratesText;
}
