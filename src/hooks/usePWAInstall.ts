'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const DISMISS_KEY = 'rmh-install-dismissed';
const DISMISS_DAYS = 30;

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePWAInstall() {
    const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const elapsed = Date.now() - parseInt(dismissedAt, 10);
            if (elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000) {
                setIsDismissed(true);
            } else {
                localStorage.removeItem(DISMISS_KEY);
            }
        }

        const handler = (e: Event) => {
            e.preventDefault();
            deferredPrompt.current = e as BeforeInstallPromptEvent;
            setCanInstall(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const promptInstall = useCallback(async () => {
        if (!deferredPrompt.current) return;
        await deferredPrompt.current.prompt();
        const { outcome } = await deferredPrompt.current.userChoice;
        if (outcome === 'accepted') {
            setCanInstall(false);
        }
        deferredPrompt.current = null;
    }, []);

    const dismiss = useCallback(() => {
        setIsDismissed(true);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }, []);

    return { canInstall, promptInstall, isDismissed, dismiss };
}
