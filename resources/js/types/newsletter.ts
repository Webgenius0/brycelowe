export type NewsletterSubscriber = {
    id: number;
    name?: string;
    email: string;
    status: 'subscribed' | 'unsubscribed';
    created_at?: string;
};
