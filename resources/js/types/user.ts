export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  address?: string;
  terms?: boolean;
  avatar?: string | null;
  created_at?: string;
  last_login_at?: string;
};