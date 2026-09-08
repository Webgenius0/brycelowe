export type ExternalUserRole = 'SUPERADMIN' | 'SELS' | 'MANAGER' | 'AUDIOTOR';

export type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  external_user_role?: ExternalUserRole | string;
  user_type?: 'INTERNAL' | 'EXTERNAL';
  status?: string;
  address?: string;
  terms?: boolean;
  avatar?: string | null;
  created_at?: string;
  last_login_at?: string;
};