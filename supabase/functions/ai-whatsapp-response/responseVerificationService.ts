
import { CustomerInfo } from './types.ts';

export interface VerificationResult {
  isApproved: boolean;
  confidence: number;
  issues: string[];
  improvedResponse?: string;
}

export async function verifyAndImproveResponse(
  originalResponse: string,
  customerMessage: string,
  customerInfo: CustomerInfo,
  openAIApiKey: string
): Promise<VerificationResult> {
  
  console.log('🔍 VERIFICACIÓN: Iniciando verificación de respuesta...');
  
  const verificationPrompt = buildVerificationPrompt(originalResponse, customerMessage, customerInfo);
  
  try {
    const verificationResponse = await callOpenAIForVerification(verificationPrompt, openAIApiKey);
    const result = parseVerificationResponse(verificationResponse);
    
    console.log(`✅ VERIFICACIÓN COMPLETADA: Aprobada=${result.isApproved}, Confianza=${result.confidence}%, Problemas=${result.issues.length}`);
    
    return result;
    
  } catch (error) {
    console.error('❌ Error en verificación - Aprobando respuesta original:', error);
    
    // Si la verificación falla, aprobar la respuesta original como fallback
    return {
      isApproved: true,
      confidence: 70,
      issues: ['Error en verificación - respuesta original aprobada por defecto'],
      improvedResponse: originalResponse
    };
  }
}

function buildVerificationPrompt(
  originalResponse: string,
  customerMessage: string,
  customerInfo: CustomerInfo
): string {
  
  const customerName = customerInfo.customerFirstName || 'Cliente';
  
  return `Eres un VERIFICADOR EXPERTO de respuestas de atención al cliente para Envíos Ojito.

Tu trabajo es VERIFICAR si la respuesta generada es:
1. PRECISA y factualmente correcta
2. APROPIADA para la consulta del cliente
3. COMPLETA y útil
4. PROFESIONAL y amigable
5. ESPECÍFICA (con fechas exactas, no información genérica)

CONTEXTO DEL CLIENTE:
- Nombre: ${customerName}
- Cliente registrado: ${customerInfo.customerFound ? 'Sí' : 'No'}
- Encomiendas en sistema: ${customerInfo.packagesCount}
- Pendientes entrega: ${customerInfo.pendingDeliveryPackages.length}
- Pendientes pago: ${customerInfo.pendingPaymentPackages.length}

CONSULTA ORIGINAL DEL CLIENTE:
"${customerMessage}"

RESPUESTA GENERADA PARA VERIFICAR:
"${originalResponse}"

CRITERIOS DE VERIFICACIÓN:

✅ APROBAR SI:
- Responde directamente la pregunta del cliente
- Usa información específica y actualizada (fechas exactas, nombres)
- Mantiene tono profesional pero amigable
- Proporciona información útil y accionable
- No contiene errores factuales
- Usa el formato correcto de monedas (ƒ para florines, $ para pesos)

❌ RECHAZAR SI:
- No responde la pregunta del cliente
- Contiene información incorrecta o contradictoria
- Es demasiado genérica o vaga
- Tono inapropiado (muy formal o muy informal)
- Falta información importante que debería incluirse
- Formato de moneda incorrecto

INSTRUCCIONES DE RESPUESTA:
Responde EXACTAMENTE en este formato JSON:

{
  "approved": true/false,
  "confidence": [número del 0-100],
  "issues": ["lista de problemas encontrados"],
  "improved_response": "respuesta mejorada si es necesario, o null si la original está bien"
}

EJEMPLOS:

Ejemplo 1 - APROBAR:
{
  "approved": true,
  "confidence": 95,
  "issues": [],
  "improved_response": null
}

Ejemplo 2 - RECHAZAR Y MEJORAR:
{
  "approved": false,
  "confidence": 30,
  "issues": ["Respuesta muy genérica", "No usa fechas específicas"],
  "improved_response": "Respuesta mejorada aquí..."
}

Analiza cuidadosamente y responde:`;
}

async function callOpenAIForVerification(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: prompt
        },
        {
          role: 'user',
          content: 'Verifica la respuesta según los criterios establecidos.'
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

function parseVerificationResponse(response: string): VerificationResult {
  try {
    // Limpiar la respuesta de posibles markdown o texto extra
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedResponse);
    
    return {
      isApproved: parsed.approved === true,
      confidence: Math.max(0, Math.min(100, parsed.confidence || 0)),
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
      improvedResponse: parsed.improved_response || undefined
    };
    
  } catch (error) {
    console.error('Error parsing verification response:', error);
    console.log('Raw response:', response);
    
    // Fallback: aprobar la respuesta original si no se puede parsear
    return {
      isApproved: true,
      confidence: 50,
      issues: ['Error parseando respuesta de verificación'],
      improvedResponse: undefined
    };
  }
}
