'use client';

import { useState, useEffect } from 'react';

/**
 * Detects whether the viewport is below the given breakpoint.
 * Matches Tailwind's `md:` breakpoint (768px) by default.
 * SSR-safe: returns `false` on the server, hydrates on mount.
 */
export function useIsMobile(breakpoint = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

        const handleChange = () => setIsMobile(mql.matches);
        handleChange();

        mql.addEventListener('change', handleChange);
        return () => mql.removeEventListener('change', handleChange);
    }, [breakpoint]);

    return isMobile;
}
