
// Función para obtener la fecha actual en zona horaria de Bogotá
export function getBogotaDate() {
  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
  console.log('Fecha y hora actual en Bogotá:', bogotaTime.toISOString());
  return bogotaTime;
}

// Función para obtener solo la fecha en formato YYYY-MM-DD en zona horaria de Bogotá
export function getBogotaDateString() {
  const bogotaDate = getBogotaDate();
  return bogotaDate.getFullYear() + '-' + 
         String(bogotaDate.getMonth() + 1).padStart(2, '0') + '-' + 
         String(bogotaDate.getDate()).padStart(2, '0');
}
