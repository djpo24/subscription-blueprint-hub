
export function TravelerPreviewPermissions() {
  return (
    <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-semibold text-yellow-800 mb-2">Permisos del Rol Viajero:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 className="font-medium text-green-700 mb-2">✅ Puede acceder a:</h4>
          <ul className="text-green-700 space-y-1">
            <li>• Dashboard (vista limitada)</li>
            <li>• Crear nuevos paquetes</li>
            <li>• Crear nuevos viajes</li>
            <li>• Viajes (solo los asignados)</li>
            <li>• Despachos (crear y gestionar)</li>
            <li>• Notificaciones (acceso completo)</li>
            <li>• Deudores (solo los relacionados)</li>
            <li>• Chat (funcionalidad básica)</li>
            <li>• Entrega móvil</li>
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-red-700 mb-2">❌ No puede acceder a:</h4>
          <ul className="text-red-700 space-y-1">
            <li>• Gestión de usuarios</li>
            <li>• Configuración del sistema</li>
            <li>• Funciones administrativas</li>
            <li>• Gestión de finanzas</li>
            <li>• Gestión completa de clientes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
