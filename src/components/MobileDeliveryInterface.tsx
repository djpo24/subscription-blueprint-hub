
interface MobileDeliveryInterfaceProps {
  onClose: () => void;
}

export function MobileDeliveryInterface({ onClose }: MobileDeliveryInterfaceProps) {
  return (
    <div className="fixed inset-0 bg-white z-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Entrega Móvil</h2>
        <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">
          Cerrar
        </button>
      </div>
      <div>
        <p>Interfaz de entrega móvil</p>
      </div>
    </div>
  );
}
