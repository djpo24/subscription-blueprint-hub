
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { CustomerInfo } from './types.ts';
import { getFirstName, formatCurrencyWithSymbol } from './utils.ts';

export async function getCustomerInfo(
  supabase: any,
  customerPhone: string,
  customerId?: string
): Promise<{ customerInfo: CustomerInfo; actualCustomerId: string | null }> {
  let customerInfo: CustomerInfo = {
    customerFound: false,
    customerFirstName: '',
    packagesCount: 0,
    packages: [],
    pendingDeliveryPackages: [],
    pendingPaymentPackages: [],
    totalPending: 0,
    totalFreight: {},
    currencyBreakdown: {}
  };

  let actualCustomerId = customerId;

  console.log(`🔍 [CustomerService] Iniciando búsqueda de cliente con teléfono: ${customerPhone}`);

  // 🔒 SEGURIDAD: Solo buscar por el número de teléfono específico del que envía el mensaje
  if (!actualCustomerId) {
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    console.log(`🔍 [CustomerService] Teléfono limpiado: ${cleanPhone}`);
    
    // Búsqueda MUY específica - solo el cliente exacto que envía el mensaje
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email, phone, whatsapp_number')
      .or(`phone.eq.${cleanPhone},whatsapp_number.eq.${cleanPhone},phone.like.%${cleanPhone}%,whatsapp_number.like.%${cleanPhone}%`)
      .limit(10);

    if (customerError) {
      console.error('❌ [CustomerService] Error finding customer by phone:', customerError);
      return { customerInfo, actualCustomerId: null };
    }

    console.log(`🔍 [CustomerService] Customers encontrados: ${customers?.length || 0}`);

    // Verificación estricta de coincidencia
    if (customers && customers.length > 0) {
      let bestMatch = null;
      
      // Buscar coincidencia exacta primero
      for (const customer of customers) {
        const customerPhone1 = (customer.phone || '').replace(/[\s\-\(\)\+]/g, '');
        const customerWhatsApp = (customer.whatsapp_number || '').replace(/[\s\-\(\)\+]/g, '');
        
        console.log(`🔍 [CustomerService] Comparando: ${cleanPhone} con phone: ${customerPhone1}, whatsapp: ${customerWhatsApp}`);
        
        // Coincidencia exacta
        if (customerPhone1 === cleanPhone || customerWhatsApp === cleanPhone) {
          bestMatch = customer;
          console.log(`✅ [CustomerService] Coincidencia exacta encontrada: ${customer.name}`);
          break;
        }
        
        // Coincidencia parcial (el teléfono del cliente termina con el número enviado)
        if (!bestMatch && (customerPhone1.endsWith(cleanPhone) || cleanPhone.endsWith(customerPhone1))) {
          bestMatch = customer;
          console.log(`✅ [CustomerService] Coincidencia parcial encontrada: ${customer.name}`);
        }
      }
      
      if (bestMatch) {
        actualCustomerId = bestMatch.id;
        customerInfo.customerFound = true;
        customerInfo.customerFirstName = getFirstName(bestMatch.name);
        console.log(`🔐 [CustomerService] Cliente identificado de forma segura: ${bestMatch.name} (ID: ${actualCustomerId})`);
      } else {
        console.log(`⚠️ [CustomerService] No se encontró coincidencia para: ${cleanPhone}`);
      }
    } else {
      console.log(`📞 [CustomerService] No se encontró cliente con teléfono: ${cleanPhone}`);
    }
  } else {
    // Si ya tenemos ID, verificar que corresponde al teléfono que envía el mensaje
    console.log(`🔍 [CustomerService] Verificando cliente existente con ID: ${actualCustomerId}`);
    
    const { data: customer, error: verifyError } = await supabase
      .from('customers')
      .select('id, name, email, phone, whatsapp_number')
      .eq('id', actualCustomerId)
      .single();

    if (verifyError || !customer) {
      console.error('❌ [CustomerService] Error verificando cliente por ID:', verifyError);
      return { customerInfo, actualCustomerId: null };
    }

    // 🔒 VERIFICACIÓN DE SEGURIDAD: El ID debe corresponder al teléfono
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    const customerPhone1 = (customer.phone || '').replace(/[\s\-\(\)\+]/g, '');
    const customerWhatsApp = (customer.whatsapp_number || '').replace(/[\s\-\(\)\+]/g, '');
    
    if (customerPhone1 === cleanPhone || customerWhatsApp === cleanPhone || 
        customerPhone1.endsWith(cleanPhone) || cleanPhone.endsWith(customerPhone1)) {
      customerInfo.customerFound = true;
      customerInfo.customerFirstName = getFirstName(customer.name);
      console.log(`🔐 [CustomerService] Cliente verificado por ID: ${customer.name}`);
    } else {
      console.error(`🚨 [CustomerService] INTENTO DE ACCESO NO AUTORIZADO: ID ${actualCustomerId} no corresponde al teléfono ${cleanPhone}`);
      actualCustomerId = null;
      return { customerInfo, actualCustomerId: null };
    }
  }

  // Solo si el cliente está autenticado, obtener su información personal
  if (actualCustomerId && customerInfo.customerFound) {
    console.log(`📊 [CustomerService] Obteniendo datos específicos para cliente: ${actualCustomerId}`);
    const packageData = await getCustomerPackageDataOptimized(supabase, actualCustomerId, customerPhone);
    customerInfo = { ...customerInfo, ...packageData };
    console.log(`📊 [CustomerService] Datos obtenidos - Encomiendas: ${packageData.packagesCount}, Pendientes entrega: ${packageData.pendingDeliveryPackages.length}, Pendientes pago: ${packageData.pendingPaymentPackages.length}`);
  }

  return { customerInfo, actualCustomerId };
}

async function getCustomerPackageDataOptimized(supabase: any, customerId: string, verificationPhone: string) {
  console.log(`🔍 [PackageData] Iniciando obtención optimizada de datos para cliente: ${customerId}`);
  
  // 🔒 VERIFICACIÓN: Confirmar que el cliente existe
  const { data: customerVerification } = await supabase
    .from('customers')
    .select('phone, whatsapp_number, name')
    .eq('id', customerId)
    .single();

  if (!customerVerification) {
    console.error(`🚨 [PackageData] Cliente ${customerId} no encontrado en verificación final`);
    return {
      packagesCount: 0,
      packages: [],
      pendingDeliveryPackages: [],
      pendingPaymentPackages: [],
      totalPending: 0,
      totalFreight: {},
      currencyBreakdown: {}
    };
  }

  console.log(`🔍 [PackageData] Cliente verificado: ${customerVerification.name}`);

  // 📦 Obtener TODAS las encomiendas de este cliente específico
  const { data: packages, error: packagesError } = await supabase
    .from('packages')
    .select(`
      id,
      tracking_number,
      status,
      destination,
      origin,
      description,
      created_at,
      delivered_at,
      amount_to_collect,
      freight,
      currency
    `)
    .eq('customer_id', customerId) // FILTRO ESTRICTO por customer_id
    .order('created_at', { ascending: false });

  if (packagesError) {
    console.error('❌ [PackageData] Error obteniendo encomiendas del cliente:', packagesError);
    return {
      packagesCount: 0,
      packages: [],
      pendingDeliveryPackages: [],
      pendingPaymentPackages: [],
      totalPending: 0,
      totalFreight: {},
      currencyBreakdown: {}
    };
  }

  if (!packages || packages.length === 0) {
    console.log(`📭 [PackageData] No se encontraron encomiendas para el cliente: ${customerId}`);
    return {
      packagesCount: 0,
      packages: [],
      pendingDeliveryPackages: [],
      pendingPaymentPackages: [],
      totalPending: 0,
      totalFreight: {},
      currencyBreakdown: {}
    };
  }

  console.log(`📦 [PackageData] Encontradas ${packages.length} encomiendas para el cliente autenticado`);

  // Calcular flete total por moneda
  const freightByCurrency = packages.reduce((acc, p) => {
    const currency = p.currency || 'COP';
    acc[currency] = (acc[currency] || 0) + (p.freight || 0);
    return acc;
  }, {} as Record<string, number>);

  console.log(`💰 [PackageData] Flete total por moneda:`, freightByCurrency);

  // Encontrar encomiendas pendientes de entrega
  const pendingDeliveryPackages = packages.filter(p => 
    p.status !== 'delivered' && p.status !== 'cancelled'
  );

  console.log(`🚚 [PackageData] Encomiendas pendientes de entrega: ${pendingDeliveryPackages.length}`);

  // Encontrar encomiendas entregadas con pagos pendientes
  const deliveredPackages = packages.filter(p => 
    (p.status === 'delivered' || p.status === 'en_destino') && 
    p.amount_to_collect && 
    p.amount_to_collect > 0
  );

  console.log(`💳 [PackageData] Encomiendas entregadas con monto a cobrar: ${deliveredPackages.length}`);

  let pendingPaymentPackages: any[] = [];
  let currencyBreakdown = {} as Record<string, number>;

  if (deliveredPackages.length > 0) {
    // 💳 Obtener pagos SOLO de este cliente específico
    const packageIds = deliveredPackages.map(p => p.id);
    const { data: payments } = await supabase
      .from('customer_payments')
      .select('*')
      .in('package_id', packageIds);

    console.log(`💳 [PackageData] Pagos encontrados: ${payments?.length || 0}`);

    // Calcular montos pendientes por moneda
    pendingPaymentPackages = deliveredPackages.map(pkg => {
      const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
      const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingAmount = (pkg.amount_to_collect || 0) - totalPaid;
      
      console.log(`💰 [PackageData] Paquete ${pkg.tracking_number}: A cobrar: ${pkg.amount_to_collect}, Pagado: ${totalPaid}, Pendiente: ${pendingAmount}`);
      
      if (pendingAmount > 0) {
        const currency = pkg.currency || 'COP';
        currencyBreakdown[currency] = (currencyBreakdown[currency] || 0) + pendingAmount;
      }
      
      return {
        ...pkg,
        totalPaid,
        pendingAmount
      };
    }).filter(p => p.pendingAmount > 0);
  }

  const totalPending = Object.values(currencyBreakdown).reduce((sum, amount) => sum + amount, 0);

  console.log(`✅ [PackageData] Datos de encomiendas procesados de forma optimizada para cliente ${customerId}:`, {
    total: packages.length,
    pendingDelivery: pendingDeliveryPackages.length,
    pendingPayment: pendingPaymentPackages.length,
    totalPending,
    currencyBreakdown
  });

  return {
    packagesCount: packages.length,
    packages,
    totalFreight: freightByCurrency,
    pendingDeliveryPackages,
    pendingPaymentPackages,
    currencyBreakdown,
    totalPending
  };
}
