
import { supabase } from '@/integrations/supabase/client';

export const fetchPackageDebts = async () => {
  console.log('🔍 Fetching package debts...');
  
  const { data: packageDebts, error: debtsError } = await supabase
    .from('package_debts')
    .select(`
      *,
      packages!inner (
        id,
        tracking_number,
        customer_id,
        destination,
        freight,
        amount_to_collect,
        status,
        trip_id,
        delivered_at,
        currency,
        customers!inner (
          name,
          phone
        ),
        trips (
          traveler_id,
          travelers (
            first_name,
            last_name
          )
        )
      )
    `)
    .neq('status', 'paid');

  if (debtsError) {
    console.error('❌ Error fetching package debts:', debtsError);
    throw debtsError;
  }

  console.log('💰 Package debts found:', packageDebts);
  return packageDebts;
};

export const fetchDeliveredPackagesWithoutDebts = async () => {
  console.log('📦 Fetching delivered packages without debt records...');
  
  const { data: deliveredPackages, error: packagesError } = await supabase
    .from('packages')
    .select(`
      *,
      customers!inner (
        name,
        phone
      ),
      trips (
        traveler_id,
        travelers (
          first_name,
          last_name
        )
      )
    `)
    .eq('status', 'delivered')
    .gt('amount_to_collect', 0);

  if (packagesError) {
    console.error('❌ Error fetching delivered packages:', packagesError);
    throw packagesError;
  }

  console.log('📦 Delivered packages with amount_to_collect > 0:', deliveredPackages);
  return deliveredPackages;
};

export const fetchCollectionStats = async () => {
  const { data: stats, error: statsError } = await supabase
    .from('collection_stats')
    .select('*')
    .single();

  if (statsError) {
    console.error('❌ Error fetching collection stats:', statsError);
  }

  return stats;
};
