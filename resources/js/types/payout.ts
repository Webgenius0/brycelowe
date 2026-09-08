import type { User } from './user';
import type { Business } from './business';

export type Payout = {
    id: number;
    user_id: number;
    business_id: number;
    amount: number;
    stripe_transfer_id?: string;
    available_balance?: number;
    remaining_balance?: number;
    status: 'pending' | 'approved' | 'rejected';
    note?: string;
    created_at?: string;
    user?: User;
    business?: Business;
};
