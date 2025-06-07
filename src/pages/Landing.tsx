
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Truck, MapPin, Clock, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GuestPackageTracking } from '@/components/GuestPackageTracking';
import { WhatsAppChatButton } from '@/components/WhatsAppChatButton';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="uber-header">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <Package className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <h1 className="text-lg md:text-2xl font-bold text-white">Envíos Ojitos</h1>
            </div>
            <Link to="/auth">
              <Button variant="secondary" size="sm" className="text-xs md:text-sm">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-10 md:py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-black mb-4 md:mb-6 leading-tight">
            Tus encomiendas, nuestra prioridad
          </h1>
          <p className="text-base md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
            Sistema completo de gestión de encomiendas con seguimiento en tiempo real, 
            rutas optimizadas y entrega confiable.
          </p>
          <div className="flex gap-4 justify-center flex-wrap px-4">
            <WhatsAppChatButton 
              size="lg"
              message="¡Hola! Me gustaría solicitar información sobre sus servicios de envíos. ¿Podrían ayudarme con las tarifas y proceso para enviar un paquete?"
            />
          </div>
        </div>
      </section>

      {/* Package Tracking Section */}
      <section className="py-10 md:py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-black mb-3 md:mb-4">¿Necesitas rastrear tu encomienda?</h2>
            <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto px-4">
              Consulta el estado de tu encomienda en tiempo real usando tu número de rastreo.
            </p>
          </div>
          <div className="flex justify-center">
            <GuestPackageTracking />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-10 md:py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12">¿Por qué elegir Envíos Ojitos?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <Truck className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Seguimiento en Tiempo Real</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Rastrea tus encomiendas desde el origen hasta el destino con actualizaciones en vivo.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <MapPin className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Rutas Optimizadas</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Algoritmos inteligentes para encontrar las mejores rutas y reducir tiempos de entrega.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <Clock className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Entrega Rápida</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Compromiso con tiempos de entrega precisos y comunicación constante.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <Shield className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Seguridad Garantizada</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Protocolo de seguridad completo para proteger tus envíos más valiosos.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <Users className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Soporte 24/7</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Equipo de atención al cliente disponible las 24 horas para resolver cualquier consulta.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="uber-card">
              <CardHeader className="pb-3 md:pb-6">
                <Package className="h-8 w-8 md:h-12 md:w-12 text-black mb-3 md:mb-4" />
                <CardTitle className="text-lg md:text-xl">Gestión Completa</CardTitle>
                <CardDescription className="text-sm md:text-base">
                  Dashboard completo para gestionar encomiendas, clientes y reportes desde un solo lugar.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 md:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            <div>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-2">10,000+</h3>
              <p className="text-xs md:text-base text-gray-600">Encomiendas Entregadas</p>
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-2">500+</h3>
              <p className="text-xs md:text-base text-gray-600">Clientes Satisfechos</p>
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-2">50+</h3>
              <p className="text-xs md:text-base text-gray-600">Ciudades Cubiertas</p>
            </div>
            <div>
              <h3 className="text-2xl md:text-4xl font-bold text-black mb-1 md:mb-2">99.5%</h3>
              <p className="text-xs md:text-base text-gray-600">Entregas Exitosas</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 px-4 bg-black text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">¿Tienes preguntas sobre nuestros servicios?</h2>
          <p className="text-base md:text-xl mb-6 md:mb-8 text-gray-300 px-4">
            Contáctanos por WhatsApp y te ayudaremos con toda la información que necesites.
          </p>
          <WhatsAppChatButton 
            size="lg"
            message="¡Hola! Tengo algunas consultas sobre sus servicios de envíos. ¿Podrían brindarme información sobre horarios de atención y proceso de envío?"
          />
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <WhatsAppChatButton variant="floating" />

      {/* Footer */}
      <footer className="py-6 md:py-8 px-4 bg-gray-100">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Package className="h-5 w-5 md:h-6 md:w-6" />
            <span className="font-bold text-sm md:text-base">Envíos Ojitos</span>
          </div>
          <p className="text-gray-600 text-xs md:text-sm">
            © 2024 Envíos Ojitos. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
