'use client';

import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export function InstallBanner() {
    const { canInstall, promptInstall, isDismissed, dismiss } = usePWAInstall();

    if (!canInstall || isDismissed) return null;

    return (
        <div className="md:hidden bg-teal-600 text-white px-4 py-2.5 flex items-center gap-3">
            <Download className="h-4 w-4 shrink-0" />
            <p className="text-sm flex-1">Add RateMyHospital to your home screen for quick access</p>
            <Button
                size="sm"
                variant="secondary"
                className="shrink-0 h-7 text-xs bg-white text-teal-700 hover:bg-teal-50"
                onClick={promptInstall}
            >
                Install
            </Button>
            <button onClick={dismiss} className="shrink-0 p-0.5" aria-label="Dismiss">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}
