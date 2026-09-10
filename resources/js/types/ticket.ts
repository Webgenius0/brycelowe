export type TicketCategory =
    | 'TECHNICAL'
    | 'BILLING'
    | 'ACCOUNT'
    | 'GENERAL'
    | 'FEATURE_REQUEST';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketStatus =
    | 'OPEN'
    | 'IN_PROGRESS'
    | 'RESOLVED'
    | 'CLOSED'
    | 'PENDING';

export interface TicketAttachment {
    id: number;
    ticket_id: number;
    file: string;
    file_url?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Ticket {
    id: number;
    ticket_id: string;
    user_id: number;
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    message: string;
    status: TicketStatus;
    is_open: boolean;
    created_at?: string;
    updated_at?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        avatar?: string;
    };
    attachments?: TicketAttachment[];
}
