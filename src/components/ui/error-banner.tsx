import { cn } from '@/lib/utils';

interface ErrorBannerProps {
    message: string | null | undefined;
    className?: string;
}

/**
 * Consistent error display banner used across the application.
 * Renders nothing when `message` is falsy.
 */
export function ErrorBanner({ message, className }: ErrorBannerProps) {
    if (!message) return null;

    return (
        <div className={cn('p-3 bg-red-50 border border-red-200 rounded-lg', className)}>
            <p className="text-sm text-red-600">{message}</p>
        </div>
    );
}
