
export interface UserActivity {
  id: string;
  created_at: string;
  activity_type: string;
  description: string;
  user_name?: string;
  user_email?: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  can_revert?: boolean;
  reverted_at?: string;
  reverted_by?: string;
}

export type ActivityType = 'all' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
