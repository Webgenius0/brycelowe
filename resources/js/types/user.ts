export type Subscription = {
  id: number;
  user_id: number;
  type: string;
  stripe_status: string;
  ends_at: string | null;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  points?: number;
  stripe_connect_id?: string;
  stripe_connect_active?: boolean;
  avatar?: string | null;
  created_at?: string;
  last_login_at?: string;
  subscriptions?: Subscription[];
};