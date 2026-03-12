'use client';

import dynamic from 'next/dynamic';
import { Employer } from '@/lib/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SubmitReviewForm } from './SubmitReviewForm';

const MobileReviewWizard = dynamic(() => import('@/components/reviews/MobileReviewWizard'), { ssr: false });

interface ReviewSubmitContentProps {
    employers: Employer[];
    userId: string;
}

export function ReviewSubmitContent({ employers, userId }: ReviewSubmitContentProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileReviewWizard employers={employers} userId={userId} />;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold mb-2">Share Your Experience</h1>
                <p className="text-muted-foreground">Your anonymous review helps other nurses make informed career decisions.</p>
            </div>
            <SubmitReviewForm employers={employers} userId={userId} />
        </div>
    );
}
