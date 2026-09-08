export type Plan = {
    id: number;
    title: string;
    description?: string;
    price: number;
    discount_price?: number;
    discount_text?: string;
    type?: string;
    duration?: number;
    image?: string;
    color?: string;
    stripe_product_id?: string;
    stripe_price_id?: string;
    points?: number;
    covers?: string;
    status: 'Active' | 'Inactive';
    created_at?: string;
    businesses?: Array<{ id: number; title: string }>;
};
