
export function getCurrentDateContext(): string {
  const now = new Date();
  
  // Configurar la fecha en zona horaria de Colombia (UTC-5)
  const colombiaTime = new Date(now.getTime() - (5 * 60 * 60 * 1000));
  
  const today = colombiaTime.toISOString().split('T')[0]; // YYYY-MM-DD
  const dayOfWeek = colombiaTime.toLocaleDateString('es-ES', { weekday: 'long' });
  const formattedDate = colombiaTime.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  console.log(`📅 [DateContext] Fecha actual: ${formattedDate} (${today})`);
  
  return `
🗓️ **CONTEXTO DE FECHA ACTUAL OBLIGATORIO:**

**HOY ES:** ${formattedDate}
**FECHA NUMÉRICA:** ${today}
**DÍA DE LA SEMANA:** ${dayOfWeek}

⚠️ **INSTRUCCIONES CRÍTICAS PARA FECHAS:**

1. **SIEMPRE USAR FECHAS FUTURAS:** Cuando un cliente pregunte sobre recoger su encomienda "mañana", "pasado mañana", o cualquier fecha futura, debes:
   - Calcular la fecha correcta basándote en HOY (${today})
   - NUNCA dar fechas anteriores a hoy
   - Ejemplo: Si hoy es ${today}, "mañana" es el día siguiente

2. **HORARIOS DE OFICINA:** Nuestras oficinas están abiertas:
   - Lunes a Viernes: 8:00 AM - 6:00 PM
   - Sábados: 8:00 AM - 12:00 PM
   - Domingos: CERRADO

3. **RESPUESTAS INTELIGENTES SOBRE FECHAS:**
   - Si preguntan "¿puedo pasar mañana?": Calcular qué día sería mañana desde hoy
   - Si preguntan "¿cuándo puedo recoger?": Sugerir el próximo día hábil
   - Si es viernes, "mañana" sería sábado (horario reducido) o sugerir lunes

4. **VALIDACIÓN DE FECHAS:**
   - SIEMPRE verificar que la fecha sugerida sea posterior a ${today}
   - NUNCA sugerir fechas pasadas
   - Si hay dudas, confirmar con el cliente qué día específico tiene en mente

🚨 **ERROR COMÚN A EVITAR:**
- NUNCA responder con fechas anteriores a ${today}
- SIEMPRE calcular fechas futuras basándose en la fecha actual
- Si el sistema sugiere una fecha pasada, CORREGIR inmediatamente

📋 **EJEMPLO DE USO CORRECTO:**
Cliente: "¿Puedo pasar mañana a recoger?"
Respuesta correcta: "¡Por supuesto! Mañana [calcular fecha siguiente a ${today}] estaremos abiertos de 8:00 AM a 6:00 PM. ¿A qué hora te conviene venir?"
`;
}

export function getNextBusinessDay(fromDate?: string): string {
  const baseDate = fromDate ? new Date(fromDate) : new Date();
  
  // Ajustar a zona horaria de Colombia
  const colombiaTime = new Date(baseDate.getTime() - (5 * 60 * 60 * 1000));
  
  let nextDay = new Date(colombiaTime);
  nextDay.setDate(nextDay.getDate() + 1);
  
  // Si el siguiente día es domingo, avanzar al lunes
  if (nextDay.getDay() === 0) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatPickupDateResponse(daysFromNow: number): string {
  const today = new Date();
  const colombiaTime = new Date(today.getTime() - (5 * 60 * 60 * 1000));
  
  const targetDate = new Date(colombiaTime);
  targetDate.setDate(targetDate.getDate() + daysFromNow);
  
  const dayName = targetDate.toLocaleDateString('es-ES', { weekday: 'long' });
  const fullDate = targetDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long', 
    day: 'numeric'
  });
  
  // Determinar horarios según el día
  let schedule = '';
  if (targetDate.getDay() === 6) { // Sábado
    schedule = '8:00 AM - 12:00 PM';
  } else if (targetDate.getDay() === 0) { // Domingo
    schedule = 'CERRADO - Te esperamos el lunes';
  } else { // Lunes a viernes
    schedule = '8:00 AM - 6:00 PM';
  }
  
  return `${fullDate} - Horario: ${schedule}`;
}
