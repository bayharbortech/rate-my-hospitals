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

// Date formatting
export const DATE_FORMAT_LONG: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
};

export const DATE_FORMAT_SHORT: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
};

export function formatDate(date: Date | string, style: 'long' | 'short' = 'long'): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const options = style === 'short' ? DATE_FORMAT_SHORT : DATE_FORMAT_LONG;
    return d.toLocaleDateString('en-US', options);
}

export function estimateReadTime(text: string): string {
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    return `${minutes} min read`;
}

// Relative time display
export function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
}

// Review form options
export const POSITION_TYPES = [
    'Staff Nurse',
    'Charge Nurse',
    'Travel Nurse',
    'CNA/Tech',
] as const;
