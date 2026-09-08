import type { User } from './user';
import type { Plan } from './plan';

export type PaymentDataRecord = {
    id: number;
    user_id?: number;
    plan_id?: number;
    amount?: number;
    stripe_intent_id?: string;
    stripe_subscription_id?: string;
    created_at?: string;
    user?: User;
    plan?: Plan;
};
