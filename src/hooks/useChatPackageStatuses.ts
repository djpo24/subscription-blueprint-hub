
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PackageStatus, PACKAGE_STATUS_CONFIG } from '@/components/chat/types/PackageStatusTypes';

interface ChatItem {
  phone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTime: string;
  timestamp?: string;
  isRegistered: boolean;
  unreadCount: number;
  profileImageUrl?: string | null;
}

export function useChatPackageStatuses(chats: ChatItem[]) {
  return useQuery({
    queryKey: ['chat-package-statuses', chats.map(c => c.phone)],
    queryFn: async (): Promise<Record<string, PackageStatus>> => {
      try {
        const statuses: Record<string, PackageStatus> = {};
        
        if (chats.length === 0) {
          return statuses;
        }

        // Crear todas las variaciones de teléfonos para búsqueda
        const allPhoneVariations: string[] = [];
        const phoneToOriginalMap: Record<string, string> = {};

        chats.forEach(chat => {
          const originalPhone = chat.phone.trim();
          const normalizedPhone = originalPhone.replace(/[\s\-\(\)\+]/g, '');
          const withCountryCode = normalizedPhone.startsWith('57') ? normalizedPhone : `57${normalizedPhone}`;
          const withoutCountryCode = normalizedPhone.startsWith('57') ? normalizedPhone.substring(2) : normalizedPhone;
          const withPlus = `+${normalizedPhone}`;
          const withPlusCountry = `+57${withoutCountryCode}`;

          const variations = [
            originalPhone,
            normalizedPhone,
            withCountryCode,
            withoutCountryCode,
            withPlus,
            withPlusCountry
          ];

          variations.forEach(variation => {
            if (!phoneToOriginalMap[variation]) {
              phoneToOriginalMap[variation] = originalPhone;
              allPhoneVariations.push(variation);
            }
          });
        });

        console.log('🔍 [useChatPackageStatuses] Processing', chats.length, 'chats with', allPhoneVariations.length, 'phone variations');

        // Buscar todos los clientes de una vez
        const { data: customers, error: customerError } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp_number')
          .or(allPhoneVariations.map(phone => 
            `phone.eq.${phone},whatsapp_number.eq.${phone}`
          ).join(','));

        if (customerError) {
          console.error('❌ [useChatPackageStatuses] Error searching customers:', customerError);
          return statuses;
        }

        console.log('🔍 [useChatPackageStatuses] Found', customers?.length || 0, 'customers');

        if (!customers || customers.length === 0) {
          return statuses;
        }

        // Mapear clientes encontrados a sus teléfonos originales
        const customerToPhoneMap: Record<string, string> = {};
        customers.forEach(customer => {
          const customerPhones = [customer.phone, customer.whatsapp_number].filter(Boolean);
          customerPhones.forEach(phone => {
            const originalPhone = phoneToOriginalMap[phone];
            if (originalPhone) {
              customerToPhoneMap[customer.id] = originalPhone;
            }
          });
        });

        // Obtener todos los paquetes para estos clientes
        const customerIds = customers.map(c => c.id);
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select('id, customer_id, status, amount_to_collect, delivered_at')
          .in('customer_id', customerIds);

        if (packagesError) {
          console.error('❌ [useChatPackageStatuses] Error fetching packages:', packagesError);
          return statuses;
        }

        if (!packages || packages.length === 0) {
          return statuses;
        }

        // Obtener todos los pagos
        const packageIds = packages.map(pkg => pkg.id);
        const { data: payments, error: paymentsError } = await supabase
          .from('customer_payments')
          .select('package_id, amount')
          .in('package_id', packageIds);

        if (paymentsError) {
          console.error('❌ [useChatPackageStatuses] Error fetching payments:', paymentsError);
          return statuses;
        }

        // Procesar cada cliente
        const customerPackages: Record<string, any[]> = {};
        packages.forEach(pkg => {
          if (!customerPackages[pkg.customer_id]) {
            customerPackages[pkg.customer_id] = [];
          }
          customerPackages[pkg.customer_id].push(pkg);
        });

        Object.entries(customerPackages).forEach(([customerId, customerPkgs]) => {
          const originalPhone = customerToPhoneMap[customerId];
          if (!originalPhone) return;

          const customerStatuses: PackageStatus[] = [];

          customerPkgs.forEach(pkg => {
            const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
            const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const pendingAmount = (pkg.amount_to_collect || 0) - totalPaid;

            if (pkg.status === 'delivered') {
              if (pkg.amount_to_collect > 0 && pendingAmount > 0) {
                customerStatuses.push('delivered_pending_payment');
              } else {
                if (pkg.delivered_at) {
                  const deliveredDate = new Date(pkg.delivered_at);
                  const now = new Date();
                  const daysDifference = (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
                  
                  if (daysDifference < 2) {
                    customerStatuses.push('delivered');
                  }
                } else {
                  customerStatuses.push('delivered');
                }
              }
            } else if (pkg.status === 'en_destino' || pkg.status === 'pending') {
              if (pkg.amount_to_collect > 0) {
                customerStatuses.push('pending_pickup_payment');
              } else {
                customerStatuses.push('pending_delivery');
              }
            } else if (pkg.status === 'transito' || pkg.status === 'in_transit' || pkg.status === 'despachado') {
              customerStatuses.push('in_transit');
            }
          });

          if (customerStatuses.length > 0) {
            const mostCriticalStatus = customerStatuses.reduce((prev, current) => {
              const prevPriority = PACKAGE_STATUS_CONFIG[prev]?.priority ?? 999;
              const currentPriority = PACKAGE_STATUS_CONFIG[current]?.priority ?? 999;
              return currentPriority < prevPriority ? current : prev;
            });

            statuses[originalPhone] = mostCriticalStatus;
          }
        });

        console.log('📊 [useChatPackageStatuses] Final statuses:', Object.keys(statuses).length, 'chats with status');
        return statuses;

      } catch (error) {
        console.error('❌ [useChatPackageStatuses] Error:', error);
        return {};
      }
    },
    enabled: chats.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1,
  });
}
