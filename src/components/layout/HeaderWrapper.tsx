'use client';

import { useScrollDirection } from '@/hooks/useScrollDirection';
import { useIsMobile } from '@/hooks/useIsMobile';

interface HeaderWrapperProps {
    children: React.ReactNode;
}

export function HeaderWrapper({ children }: HeaderWrapperProps) {
    const direction = useScrollDirection(10);
    const isMobile = useIsMobile();

    const shouldHide = isMobile && direction === 'down';

    return (
        <div
            className={`sticky top-0 z-50 transition-transform duration-200 ${
                shouldHide ? '-translate-y-full' : 'translate-y-0'
            }`}
        >
            {children}
        </div>
    );
}
