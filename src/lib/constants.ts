// Blog
export const BLOG_CATEGORIES = ['Career', 'Working Conditions', 'Salary', 'Wellness', 'Education', 'Tech', 'Tips'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const DEFAULT_BLOG_IMAGE = '/images/blog/default.jpg';
export const DEFAULT_READ_TIME = '5 min read';
export const WORDS_PER_MINUTE = 200;

// Site branding
export const SITE_NAME = 'RateMyHospital';
export const BLOG_NAME = 'The Nursing Station';
export const BLOG_AUTHOR = 'The Nursing Station';
export const BLOG_AUTHOR_SUBTITLE = 'Editorial Team';

import {
    format,
    parseISO,
    isToday,
    isYesterday,
    differenceInDays,
    differenceInWeeks,
    differenceInMonths,
} from 'date-fns';

export function formatDate(date: Date | string, style: 'long' | 'short' = 'long'): string {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, style === 'short' ? 'MMM d, yyyy' : 'MMMM d, yyyy');
}

export function estimateReadTime(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    return `${minutes} min read`;
}

export function getTimeAgo(dateString: string): string {
    const date = parseISO(dateString);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    const days = differenceInDays(new Date(), date);
    if (days < 7) return `${days} days ago`;
    const weeks = differenceInWeeks(new Date(), date);
    if (weeks < 5) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    const months = differenceInMonths(new Date(), date);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
}

// Review form options
export const POSITION_TYPES = [
    'Staff Nurse',
    'Charge Nurse',
    'Travel Nurse',
    'CNA/Tech',
] as const;
