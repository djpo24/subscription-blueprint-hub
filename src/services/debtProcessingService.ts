
import { DebtRecord, TravelerStat, DebtDataResult, CollectionStats } from '@/types/debt';

export const processDebtsFromDatabase = (dbDebts: any[]): DebtRecord[] => {
  if (!dbDebts || dbDebts.length === 0) {
    console.log('📦 No debts to process from database');
    return [];
  }

  console.log('🔄 Processing debts from database:', dbDebts.length);

  return dbDebts.map(debt => {
    const record: DebtRecord = {
      package_id: debt.package_id,
      tracking_number: debt.tracking_number,
      customer_name: debt.customer_name || '',
      customer_phone: debt.customer_phone || '',
      destination: debt.destination || '',
      traveler_name: debt.traveler_name || 'Sin asignar',
      amount_to_collect: Number(debt.amount_to_collect || 0),
      pending_amount: Number(debt.pending_amount || 0),
      paid_amount: Number(debt.paid_amount || 0),
      debt_status: debt.debt_status || 'pending',
      debt_type: debt.debt_type || 'uncollected',
      debt_start_date: debt.debt_start_date || '',
      debt_days: Number(debt.debt_days || 0),
      package_status: debt.package_status || '',
      freight: Number(debt.freight || 0),
      debt_id: debt.debt_id || null,
      delivery_date: debt.delivery_date || '',
      created_at: debt.created_at || '',
      currency: debt.currency || 'COP'
    };

    console.log(`📦 Processed debt for ${debt.tracking_number}: type=${record.debt_type}, status=${record.package_status}, days=${record.debt_days}`);
    return record;
  });
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
