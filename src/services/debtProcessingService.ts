
import { DebtRecord, TravelerStat, DebtDataResult, CollectionStats } from '@/types/debt';

export const processRegisteredDebts = (packageDebts: any[]): DebtRecord[] => {
  if (!packageDebts) return [];

  return packageDebts.map(debt => {
    const pkg = debt.packages;
    const travelerName = pkg.trips?.travelers 
      ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
      : 'Sin asignar';

    const debtDays = debt.debt_start_date 
      ? Math.max(0, Math.floor((new Date().getTime() - new Date(debt.debt_start_date).getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      package_id: pkg.id,
      tracking_number: pkg.tracking_number,
      customer_name: pkg.customers.name,
      customer_phone: pkg.customers.phone,
      destination: pkg.destination,
      traveler_name: travelerName,
      amount_to_collect: pkg.amount_to_collect,
      pending_amount: debt.pending_amount,
      paid_amount: debt.paid_amount,
      debt_status: debt.status,
      debt_type: debt.debt_type,
      debt_start_date: debt.debt_start_date,
      debt_days: debtDays,
      package_status: pkg.status,
      freight: pkg.freight,
      debt_id: debt.id,
      delivery_date: debt.delivery_date,
      created_at: debt.created_at,
      currency: debt.currency || pkg.currency || 'COP'
    };
  });
};

export const processUnregisteredDebts = (deliveredPackages: any[], registeredPackageIds: Set<string>): DebtRecord[] => {
  if (!deliveredPackages) return [];

  const unregisteredDebts: DebtRecord[] = [];

  for (const pkg of deliveredPackages) {
    if (!registeredPackageIds.has(pkg.id)) {
      console.log(`⚠️ Found delivered package without debt record: ${pkg.tracking_number}`);
      
      const travelerName = pkg.trips?.travelers 
        ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
        : 'Sin asignar';

      const deliveryDate = new Date(pkg.delivered_at);
      const debtDays = Math.max(0, Math.floor((new Date().getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)));

      unregisteredDebts.push({
        package_id: pkg.id,
        tracking_number: pkg.tracking_number,
        customer_name: pkg.customers.name,
        customer_phone: pkg.customers.phone,
        destination: pkg.destination,
        traveler_name: travelerName,
        amount_to_collect: pkg.amount_to_collect,
        pending_amount: pkg.amount_to_collect,
        paid_amount: 0,
        debt_status: 'pending',
        debt_type: 'unpaid',
        debt_start_date: pkg.delivered_at.split('T')[0],
        debt_days: debtDays,
        package_status: pkg.status,
        freight: pkg.freight,
        debt_id: null,
        delivery_date: pkg.delivered_at,
        created_at: pkg.created_at,
        currency: pkg.currency || 'COP'
      });
    }
  }

  return unregisteredDebts;
};

export const processTravelerStats = (debts: DebtRecord[]): TravelerStat[] => {
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

  return Object.values(travelerSummary);
};

export const buildDebtDataResult = (
  debts: DebtRecord[], 
  travelerStats: TravelerStat[], 
  collectionStats: any
): DebtDataResult => {
  return {
    debts,
    travelerStats,
    collectionStats: collectionStats || {
      total_pending: 0,
      total_collected: 0,
      pending_payment: 0,
      overdue_30_days: 0,
      total_packages: 0,
      delivered_packages: 0
    }
  };
};
