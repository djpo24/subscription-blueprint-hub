import { DebtRecord, TravelerStat, DebtDataResult, CollectionStats } from '@/types/debt';

export const processRegisteredDebts = (packageDebts: any[]): DebtRecord[] => {
  if (!packageDebts || packageDebts.length === 0) {
    console.log('📦 No registered package debts to process');
    return [];
  }

  console.log('🔄 Processing registered debts:', packageDebts.length);

  return packageDebts.map(debt => {
    const pkg = debt.packages;
    const travelerName = pkg?.trips?.travelers 
      ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
      : 'Sin asignar';

    const debtDays = debt.debt_start_date 
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(debt.debt_start_date).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    const record: DebtRecord = {
      package_id: pkg?.id || '',
      tracking_number: pkg?.tracking_number || '',
      customer_name: pkg?.customers?.name || '',
      customer_phone: pkg?.customers?.phone || '',
      destination: pkg?.destination || '',
      traveler_name: travelerName,
      amount_to_collect: Number(pkg?.amount_to_collect || 0),
      pending_amount: Number(debt.pending_amount || 0),
      paid_amount: Number(debt.paid_amount || 0),
      debt_status: debt.status || 'pending',
      debt_type: debt.debt_type || 'unpaid',
      debt_start_date: debt.debt_start_date || '',
      debt_days: debtDays,
      package_status: pkg?.status || '',
      freight: Number(pkg?.freight || 0),
      debt_id: debt.id || null,
      delivery_date: debt.delivery_date || '',
      created_at: debt.created_at || '',
      currency: debt.currency || pkg?.currency || 'COP'
    };

    return record;
  });
};

export const processUnregisteredDebts = (deliveredPackages: any[], registeredPackageIds: Set<string>): DebtRecord[] => {
  if (!deliveredPackages || deliveredPackages.length === 0) {
    console.log('📦 No delivered packages to check for unregistered debts');
    return [];
  }

  const unregisteredDebts: DebtRecord[] = [];

  for (const pkg of deliveredPackages) {
    if (!registeredPackageIds.has(pkg.id)) {
      console.log(`⚠️ Found package without debt record: ${pkg.tracking_number}, status: ${pkg.status}`);
      
      const travelerName = pkg.trips?.travelers 
        ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
        : 'Sin asignar';

      // Determinar el tipo de deuda basado en el estado del paquete
      let debtType = 'uncollected';
      let debtStartDate = pkg.delivered_at || pkg.created_at;
      
      if (pkg.status === 'delivered') {
        debtType = 'unpaid'; // Paquete entregado sin pago
        debtStartDate = pkg.delivered_at;
        console.log(`📦 Package ${pkg.tracking_number} is delivered, marking as 'unpaid'`);
      } else {
        debtType = 'uncollected'; // Paquete no recogido
        console.log(`📦 Package ${pkg.tracking_number} is not delivered, marking as 'uncollected'`);
      }

      const startDate = new Date(debtStartDate);
      const debtDays = Math.max(0, Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

      const record: DebtRecord = {
        package_id: pkg.id,
        tracking_number: pkg.tracking_number,
        customer_name: pkg.customers?.name || '',
        customer_phone: pkg.customers?.phone || '',
        destination: pkg.destination,
        traveler_name: travelerName,
        amount_to_collect: Number(pkg.amount_to_collect || 0),
        pending_amount: Number(pkg.amount_to_collect || 0),
        paid_amount: 0,
        debt_status: 'pending',
        debt_type: debtType,
        debt_start_date: debtStartDate ? debtStartDate.split('T')[0] : '',
        debt_days: debtDays,
        package_status: pkg.status,
        freight: Number(pkg.freight || 0),
        debt_id: null,
        delivery_date: pkg.status === 'delivered' ? (pkg.delivered_at || '') : '',
        created_at: pkg.created_at || '',
        currency: pkg.currency || 'COP'
      };

      unregisteredDebts.push(record);
    }
  }

  console.log('⚠️ Processed unregistered debts:', unregisteredDebts.length);
  return unregisteredDebts;
};

export const processTravelerStats = (debts: DebtRecord[]): TravelerStat[] => {
  if (!debts || debts.length === 0) {
    console.log('👥 No debts to process for traveler stats');
    return [];
  }

  console.log('👥 Processing traveler stats for', debts.length, 'debts');

  const travelerSummary = debts.reduce((acc: Record<string, any>, debt: DebtRecord) => {
    const travelerId = debt.traveler_name || 'Sin asignar';
    
    if (!acc[travelerId]) {
      acc[travelerId] = {
        id: travelerId,
        name: debt.traveler_name || 'Sin asignar',
        totalPackages: 0,
        totalAmountToCollect: 0,
        totalFreight: 0,
        deliveredPackages: 0,
        pendingPackages: 0,
        revenue: 0,
        totalCollected: 0,
        pendingAmount: 0
      };
    }

    acc[travelerId].totalPackages += 1;
    acc[travelerId].totalAmountToCollect += Number(debt.amount_to_collect || 0);
    acc[travelerId].totalFreight += Number(debt.freight || 0);
    acc[travelerId].totalCollected += Number(debt.paid_amount || 0);
    acc[travelerId].pendingAmount += Number(debt.pending_amount || 0);
    
    if (debt.package_status === 'delivered') {
      acc[travelerId].deliveredPackages += 1;
      acc[travelerId].revenue += Number(debt.freight || 0);
    } else {
      acc[travelerId].pendingPackages += 1;
    }

    return acc;
  }, {});

  const stats = Object.values(travelerSummary) as TravelerStat[];
  console.log('👥 Generated traveler stats for', stats.length, 'travelers');
  return stats;
};

export const buildDebtDataResult = (
  debts: DebtRecord[], 
  travelerStats: TravelerStat[], 
  collectionStats: any
): DebtDataResult => {
  console.log('🏗️ Building final debt data result');
  
  const defaultStats: CollectionStats = {
    total_pending: 0,
    total_collected: 0,
    pending_payment: 0,
    overdue_30_days: 0,
    total_packages: 0,
    delivered_packages: 0
  };

  const result: DebtDataResult = {
    debts,
    travelerStats,
    collectionStats: collectionStats || defaultStats
  };

  console.log('🏗️ Final result built with:', {
    debts: result.debts.length,
    travelers: result.travelerStats.length,
    hasStats: !!collectionStats
  });

  return result;
};
