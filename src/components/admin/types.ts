
export interface UserActivity {
  id: string;
  created_at: string;
  activity_type: string;
  description: string;
  user_name?: string;
  user_email?: string;
}

export type ActivityType = 'all' | 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';
