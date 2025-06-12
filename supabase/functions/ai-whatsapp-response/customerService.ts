
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

  // 🔒 SEGURIDAD: Solo buscar por el número de teléfono específico del que envía el mensaje
  if (!actualCustomerId) {
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    
    // Búsqueda MUY específica - solo el cliente exacto que envía el mensaje
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id, name, email, phone, whatsapp_number')
      .or(`phone.eq.${cleanPhone},whatsapp_number.eq.${cleanPhone}`)
      .limit(1);

    if (customerError) {
      console.error('❌ Error finding customer by phone:', customerError);
      return { customerInfo, actualCustomerId: null };
    }

    // Verificación estricta de coincidencia
    if (customers && customers.length > 0) {
      const customer = customers[0];
      const customerPhone1 = (customer.phone || '').replace(/[\s\-\(\)\+]/g, '');
      const customerWhatsApp = (customer.whatsapp_number || '').replace(/[\s\-\(\)\+]/g, '');
      
      // Solo asignar si hay coincidencia EXACTA
      if (customerPhone1 === cleanPhone || customerWhatsApp === cleanPhone) {
        actualCustomerId = customer.id;
        customerInfo.customerFound = true;
        customerInfo.customerFirstName = getFirstName(customer.name);
        console.log(`🔐 Cliente identificado de forma segura: ${customer.name} (${cleanPhone})`);
      } else {
        console.log(`⚠️ No se encontró coincidencia exacta para: ${cleanPhone}`);
      }
    } else {
      console.log(`📞 No se encontró cliente con teléfono: ${cleanPhone}`);
    }
  } else {
    // Si ya tenemos ID, verificar que corresponde al teléfono que envía el mensaje
    const { data: customer, error: verifyError } = await supabase
      .from('customers')
      .select('id, name, email, phone, whatsapp_number')
      .eq('id', actualCustomerId)
      .single();

    if (verifyError || !customer) {
      console.error('❌ Error verificando cliente por ID:', verifyError);
      return { customerInfo, actualCustomerId: null };
    }

    // 🔒 VERIFICACIÓN DE SEGURIDAD: El ID debe corresponder al teléfono
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    const customerPhone1 = (customer.phone || '').replace(/[\s\-\(\)\+]/g, '');
    const customerWhatsApp = (customer.whatsapp_number || '').replace(/[\s\-\(\)\+]/g, '');
    
    if (customerPhone1 === cleanPhone || customerWhatsApp === cleanPhone) {
      customerInfo.customerFound = true;
      customerInfo.customerFirstName = getFirstName(customer.name);
      console.log(`🔐 Cliente verificado por ID: ${customer.name}`);
    } else {
      console.error(`🚨 INTENTO DE ACCESO NO AUTORIZADO: ID ${actualCustomerId} no corresponde al teléfono ${cleanPhone}`);
      actualCustomerId = null;
      return { customerInfo, actualCustomerId: null };
    }
  }

  // Solo si el cliente está autenticado, obtener su información personal
  if (actualCustomerId && customerInfo.customerFound) {
    console.log(`📊 Obteniendo datos específicos para cliente: ${actualCustomerId}`);
    const packageData = await getCustomerPackageDataSecure(supabase, actualCustomerId, customerPhone);
    customerInfo = { ...customerInfo, ...packageData };
  }

  return { customerInfo, actualCustomerId };
}

async function getCustomerPackageDataSecure(supabase: any, customerId: string, verificationPhone: string) {
  // 🔒 DOBLE VERIFICACIÓN: Antes de obtener datos sensibles, verificar nuevamente
  const { data: customerVerification } = await supabase
    .from('customers')
    .select('phone, whatsapp_number')
    .eq('id', customerId)
    .single();

  if (!customerVerification) {
    console.error(`🚨 Cliente ${customerId} no encontrado en verificación final`);
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

  const cleanVerificationPhone = verificationPhone.replace(/[\s\-\(\)\+]/g, '');
  const cleanCustomerPhone = (customerVerification.phone || '').replace(/[\s\-\(\)\+]/g, '');
  const cleanCustomerWhatsApp = (customerVerification.whatsapp_number || '').replace(/[\s\-\(\)\+]/g, '');

  if (cleanCustomerPhone !== cleanVerificationPhone && cleanCustomerWhatsApp !== cleanVerificationPhone) {
    console.error(`🚨 VIOLACIÓN DE SEGURIDAD: Intento de acceso a datos del cliente ${customerId} desde teléfono no autorizado ${verificationPhone}`);
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

  // 📦 Obtener SOLO las encomiendas de este cliente específico
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
    console.error('❌ Error obteniendo encomiendas del cliente:', packagesError);
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
    console.log(`📭 No se encontraron encomiendas para el cliente: ${customerId}`);
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

  console.log(`📦 Encontradas ${packages.length} encomiendas para el cliente autenticado`);

  // Calcular flete total por moneda
  const freightByCurrency = packages.reduce((acc, p) => {
    const currency = p.currency || 'COP';
    acc[currency] = (acc[currency] || 0) + (p.freight || 0);
    return acc;
  }, {} as Record<string, number>);

  // Encontrar encomiendas pendientes de entrega
  const pendingDeliveryPackages = packages.filter(p => 
    p.status !== 'delivered' && p.status !== 'cancelled'
  );

  // Encontrar encomiendas entregadas con pagos pendientes
  const deliveredPackages = packages.filter(p => 
    (p.status === 'delivered' || p.status === 'en_destino') && 
    p.amount_to_collect && 
    p.amount_to_collect > 0
  );

  let pendingPaymentPackages: any[] = [];
  let currencyBreakdown = {} as Record<string, number>;

  if (deliveredPackages.length > 0) {
    // 💳 Obtener pagos SOLO de este cliente específico
    const packageIds = deliveredPackages.map(p => p.id);
    const { data: payments } = await supabase
      .from('customer_payments')
      .select('*')
      .in('package_id', packageIds);

    // Calcular montos pendientes por moneda
    pendingPaymentPackages = deliveredPackages.map(pkg => {
      const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
      const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingAmount = (pkg.amount_to_collect || 0) - totalPaid;
      
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

  console.log(`✅ Datos de encomiendas procesados de forma segura para cliente ${customerId}:`, {
    total: packages.length,
    pendingDelivery: pendingDeliveryPackages.length,
    pendingPayment: pendingPaymentPackages.length,
    totalPending
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
