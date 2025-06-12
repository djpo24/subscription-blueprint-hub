
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

  // If no customerId provided, try to find customer by phone
  if (!actualCustomerId) {
    const cleanPhone = customerPhone.replace(/[\s\-\(\)\+]/g, '');
    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, email')
      .or(`phone.ilike.%${cleanPhone}%,whatsapp_number.ilike.%${cleanPhone}%`)
      .limit(1);

    if (customers && customers.length > 0) {
      actualCustomerId = customers[0].id;
      customerInfo.customerFound = true;
      customerInfo.customerFirstName = getFirstName(customers[0].name);
    }
  } else {
    // Get customer info by ID
    const { data: customer } = await supabase
      .from('customers')
      .select('name, email, phone')
      .eq('id', actualCustomerId)
      .single();

    if (customer) {
      customerInfo.customerFound = true;
      customerInfo.customerFirstName = getFirstName(customer.name);
    }
  }

  // If customer found, get comprehensive package and payment information
  if (actualCustomerId && customerInfo.customerFound) {
    const packageData = await getCustomerPackageData(supabase, actualCustomerId);
    customerInfo = { ...customerInfo, ...packageData };
  }

  return { customerInfo, actualCustomerId };
}

async function getCustomerPackageData(supabase: any, customerId: string) {
  // Get all customer packages
  const { data: packages } = await supabase
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
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (!packages || packages.length === 0) {
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

  // Calculate total freight by currency
  const freightByCurrency = packages.reduce((acc, p) => {
    const currency = p.currency || 'COP';
    acc[currency] = (acc[currency] || 0) + (p.freight || 0);
    return acc;
  }, {} as Record<string, number>);

  // Find pending delivery packages (not delivered yet)
  const pendingDeliveryPackages = packages.filter(p => 
    p.status !== 'delivered' && p.status !== 'cancelled'
  );

  // Find packages that are delivered but have pending payments
  const deliveredPackages = packages.filter(p => 
    (p.status === 'delivered' || p.status === 'en_destino') && 
    p.amount_to_collect && 
    p.amount_to_collect > 0
  );

  let pendingPaymentPackages: any[] = [];
  let currencyBreakdown = {} as Record<string, number>;

  if (deliveredPackages.length > 0) {
    // Get payments for these packages
    const { data: payments } = await supabase
      .from('customer_payments')
      .select('*')
      .in('package_id', deliveredPackages.map(p => p.id));

    // Calculate pending amounts by currency
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
