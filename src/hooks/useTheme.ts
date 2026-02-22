'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'rmh-theme';

function getSystemPreference(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
    const root = document.documentElement;
    if (resolved === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
}

export function useTheme() {
    const [theme, setThemeState] = useState<Theme>('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const initial = stored || 'light';
        setThemeState(initial);
        applyTheme(initial === 'system' ? getSystemPreference() : initial);
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (theme !== 'system') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');

        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, [theme, mounted]);

    const setTheme = useCallback((newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
        applyTheme(newTheme === 'system' ? getSystemPreference() : newTheme);
    }, []);

    const resolvedTheme = theme === 'system' ? getSystemPreference() : theme;

    return { theme, setTheme, resolvedTheme, mounted };
}
