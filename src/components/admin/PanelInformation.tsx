
export function PanelInformation() {
  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">Información del Panel</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Este panel muestra una vista simulada de actividades de usuario</li>
        <li>• En una implementación real, se conectaría a tablas de auditoría del sistema</li>
        <li>• Las actividades críticas pueden ser marcadas para revisión manual</li>
        <li>• Se mantiene un registro completo por razones de seguridad y cumplimiento</li>
      </ul>
    </div>
  );
}
