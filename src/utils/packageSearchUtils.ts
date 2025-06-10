
// Función para filtrar paquetes basada en el término de búsqueda
export function filterPackagesBySearchTerm<T extends {
  tracking_number: string;
  customers?: {
    name: string;
    id_number?: string;
    phone?: string;
  } | null;
}>(packages: T[], searchTerm: string): T[] {
  if (!searchTerm.trim()) {
    return packages;
  }

  const searchLower = searchTerm.toLowerCase().trim();

  return packages.filter((pkg) => {
    // Buscar por número de encomienda
    if (pkg.tracking_number.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Buscar por datos del cliente si existen
    if (pkg.customers) {
      // Buscar por nombre
      if (pkg.customers.name && pkg.customers.name.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Buscar por cédula (si existe)
      if (pkg.customers.id_number && pkg.customers.id_number.toLowerCase().includes(searchLower)) {
        return true;
      }

      // Buscar por teléfono (si existe)
      if (pkg.customers.phone && pkg.customers.phone.toLowerCase().includes(searchLower)) {
        return true;
      }
    }

    return false;
  });
}
