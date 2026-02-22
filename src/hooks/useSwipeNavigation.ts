'use client';

import { useRef, useCallback, useEffect } from 'react';

interface SwipeOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    threshold?: number;
    maxVerticalDrift?: number;
}

export function useSwipeNavigation({
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
    maxVerticalDrift = 30,
}: SwipeOptions) {
    const ref = useRef<HTMLDivElement>(null);
    const startX = useRef(0);
    const startY = useRef(0);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        startX.current = e.touches[0].clientX;
        startY.current = e.touches[0].clientY;
    }, []);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        const dx = e.changedTouches[0].clientX - startX.current;
        const dy = Math.abs(e.changedTouches[0].clientY - startY.current);

        if (dy > maxVerticalDrift) return;
        if (Math.abs(dx) < threshold) return;

        if (dx < 0) {
            onSwipeLeft?.();
        } else {
            onSwipeRight?.();
        }
    }, [onSwipeLeft, onSwipeRight, threshold, maxVerticalDrift]);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        el.addEventListener('touchstart', handleTouchStart, { passive: true });
        el.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            el.removeEventListener('touchstart', handleTouchStart);
            el.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchEnd]);

    return ref;
}
