'use client';

import { useRef, useCallback } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PrintButtonProps {
    contentRef: React.RefObject<HTMLDivElement | null>;
    documentTitle?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    label?: string;
    showIcon?: boolean;
    onBeforePrint?: () => Promise<void>;
    onAfterPrint?: () => void;
}

export function PrintButton({
    contentRef,
    documentTitle = 'RateMyHospital',
    variant = 'outline',
    size = 'sm',
    className,
    label = 'Print',
    showIcon = true,
    onBeforePrint,
    onAfterPrint,
}: PrintButtonProps) {
    const handlePrint = useReactToPrint({
        contentRef,
        documentTitle,
        onBeforePrint,
        onAfterPrint,
        pageStyle: `
            @page { margin: 20mm; }
            @media print {
                body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
        `,
    });

    return (
        <Button
            variant={variant}
            size={size}
            className={className}
            onClick={() => handlePrint()}
        >
            {showIcon && <Printer className="h-4 w-4 mr-2" />}
            {label}
        </Button>
    );
}

export function usePrintRef() {
    return useRef<HTMLDivElement>(null);
}
