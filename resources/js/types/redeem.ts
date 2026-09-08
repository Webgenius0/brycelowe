import type { User } from './user';
import type { Business } from './business';

export type Redemption = {
    id: number;
    user_id: number;
    business_id: number;
    points: number;
    quantity?: number;
    free_children_qty?: number;
    children_qty?: number;
    adult_qty?: number;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
    user?: User;
    business?: Business;
};
