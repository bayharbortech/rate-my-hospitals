'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 400);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <Button
            variant="outline"
            size="icon"
            className={`fixed bottom-20 right-4 md:bottom-8 z-40 h-10 w-10 rounded-full shadow-lg bg-teal-600 text-white border-teal-600 hover:bg-teal-700 hover:text-white transition-opacity duration-200 ${
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
        >
            <ChevronUp className="h-5 w-5" />
        </Button>
    );
}
