
import { supabase } from '@/integrations/supabase/client';

export const fetchAllDebts = async () => {
  console.log('🔍 Fetching all debts using database function...');
  
  const { data: debts, error } = await supabase
    .rpc('get_collection_packages', {
      p_limit: 1000,
      p_offset: 0
    });

  if (error) {
    console.error('❌ Error fetching debts:', error);
    throw error;
  }

  console.log('💰 Debts found from database function:', debts?.length || 0);
  return debts || [];
};

export const fetchCollectionStats = async () => {
  console.log('📈 Fetching collection stats...');
  
  const { data: stats, error: statsError } = await supabase
    .from('collection_stats')
    .select('*')
    .single();

  if (statsError) {
    console.error('❌ Error fetching collection stats:', statsError);
    // Don't throw here, return null instead to allow the app to continue
    return null;
  }

  console.log('📈 Collection stats fetched successfully');
  return stats;
};
