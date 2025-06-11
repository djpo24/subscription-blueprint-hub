
import { AdminSetupCard } from '@/components/admin/AdminSetupCard';
import { Package } from 'lucide-react';

export default function Setup() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="uber-header">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Envíos Ojitos - Configuración</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Setup Content */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Configuración Inicial
            </h2>
            <p className="text-gray-600">
              Crea el primer usuario administrador para acceder al sistema
            </p>
          </div>
          
          <AdminSetupCard />
        </div>
      </div>
    </div>
  );
}
