'use client';

import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/stores/useThemeStore';

export function ThemeToggle() {
    const { mounted, setTheme, resolvedTheme, initialize } = useThemeStore();

    useEffect(() => { initialize(); }, [initialize]);

    const resolved = resolvedTheme();

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Toggle theme">
                <Sun className="h-4 w-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${resolved === 'dark' ? 'light' : 'dark'} mode`}
        >
            {resolved === 'dark' ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </Button>
    );
}
