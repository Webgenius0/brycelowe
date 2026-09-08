import type { User } from './user';

export type DaySchedule = {
    open: string;
    close: string;
    is_closed?: boolean;
};

export type OpeningHoursMap = Record<string, DaySchedule> | { open?: string; close?: string; [key: string]: any };

export type TodayOpeningHours = {
    day: string;
    is_closed: boolean;
    open: string | null;
    close: string | null;
    formatted: string;
};

export type Business = {
    id: number;
    user_id?: number;
    title: string;
    description?: string;
    category?: string;
    logo?: string;
    banner?: string;
    address?: string;
    longitude?: string;
    latitude?: string;
    phone?: string;
    email?: string;
    social_media_links?: Record<string, any>;
    opening_hours?: OpeningHoursMap;
    opening_days?: string[];
    today_opening_hours?: TodayOpeningHours;
    gallery?: string[];
    free_children_points?: number;
    free_children_age?: string;
    children_points?: number;
    children_age?: string;
    adult_points?: number;
    adult_age?: string;
    discount_text?: string;
    status: 'Active' | 'Inactive' | 'Pending';
    created_at?: string;
    user?: User;
};
