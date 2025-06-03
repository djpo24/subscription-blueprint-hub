
export function formatPackageDescription(description: string): string {
  if (!description) return '';
  
  // Dividir por comas, punto y coma, o saltos de línea para obtener los items
  const items = description.split(/[,;\n]/).map(item => item.trim()).filter(item => item.length > 0);
  
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  
  // Si hay más de un item, mostrar el primero + primeros 4 caracteres del segundo + "..."
  const firstItem = items[0];
  const secondItemPreview = items[1].substring(0, 4);
  
  return `${firstItem}, ${secondItemPreview}...`;
}
