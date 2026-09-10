export type OveragesType = 'CALL' | 'REPORT' | 'PLAYBOOK' | 'CALIBRATION';

export interface OveragesRate {
    id?: number;
    plan_id?: number;
    overages_type: OveragesType;
    overages_rate: number | string;
    created_at?: string;
    updated_at?: string;
}

export interface Discount {
    id?: number;
    plan_id?: number;
    title: string;
    code: string;
    percent?: number | null;
    amount?: number | string | null;
    valid_until?: string | null;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Plan {
    id: number;
    name: string;
    description: string | null;
    price: number | string;
    discount_price: number | string | null;
    interval: 'MONTHLY' | 'YEARLY' | 'WEEKLY' | 'DAILY' | 'LIFETIME' | 'CUSTOM';
    call_credit: number;
    report_credit: number;
    playbook_credit: number;
    calibration_credit: number;
    is_active: boolean;
    is_trial: boolean;
    trial_period: number;
    overages_rates?: OveragesRate[];
    discounts?: Discount[];
    created_at?: string;
    updated_at?: string;
}
