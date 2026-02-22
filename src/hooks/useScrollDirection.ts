'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * Tracks scroll direction with a threshold to avoid jitter.
 * Returns 'up' when scrolling up and 'down' when scrolling down.
 * SSR-safe: defaults to 'up' on the server.
 */
export function useScrollDirection(threshold = 10): 'up' | 'down' {
    const [direction, setDirection] = useState<'up' | 'down'>('up');
    const lastY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        lastY.current = window.scrollY;

        const updateDirection = () => {
            const currentY = window.scrollY;
            const diff = currentY - lastY.current;

            if (Math.abs(diff) >= threshold) {
                setDirection(diff > 0 ? 'down' : 'up');
                lastY.current = currentY;
            }

            ticking.current = false;
        };

        const onScroll = () => {
            if (!ticking.current) {
                ticking.current = true;
                requestAnimationFrame(updateDirection);
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return direction;
}
