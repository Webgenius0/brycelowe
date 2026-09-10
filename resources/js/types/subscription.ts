import { Plan } from './plan';

export type SubscriptionStatus =
    | 'ACTIVE'
    | 'TRIALING'
    | 'PAST_DUE'
    | 'CANCELED'
    | 'EXPIRED'
    | 'PENDING';

export interface Billing {
    id: number;
    user_id: number;
    subscription_id: number;
    invoice_number: string;
    date: string;
    status: string;
    pdf?: string;
    pdf_url?: string;
    call_credit: number;
    report_credit: number;
    playbook_credit: number;
    calibration_credit: number;
    overusages_amount: number | string;
    created_at?: string;
    updated_at?: string;
}

export interface Usages {
    id?: number;
    subscription_id: number;
    call_credit: number;
    report_credit: number;
    playbook_credit: number;
    calibration_credit: number;
    get_total_overusages_amount: number | string;
    created_at?: string;
    updated_at?: string;
}

export interface Overusages {
    id?: number;
    subscription_id: number;
    overusages_type: 'CALL' | 'REPORT' | 'PLAYBOOK' | 'CALIBRATION' | string;
    credit: number;
    is_paid: boolean;
    created_at?: string;
}

export interface Subscription {
    id: number;
    user_id: number;
    plan_id: number;
    started_at?: string;
    current_period_start?: string;
    current_period_end?: string;
    end_at?: string;
    status: SubscriptionStatus;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    plan?: Plan;
    usages?: Usages;
    overusages?: Overusages[];
    billings?: Billing[];
}
