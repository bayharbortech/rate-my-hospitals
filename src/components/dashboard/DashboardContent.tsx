'use client';

import dynamic from 'next/dynamic';
import { useIsMobile } from '@/hooks/useIsMobile';
import { DashboardPageClient } from '@/app/dashboard/DashboardPageClient';
import { Employer, Review } from '@/lib/types';

interface ReviewWithEmployerName extends Review {
    employer: { name: string };
}

interface DashboardContentProps {
    employers: Employer[];
    reviews: Review[];
    userReviews: ReviewWithEmployerName[];
    userProfile: { email: string; display_name: string | null };
}

const MobileDashboard = dynamic(
    () => import('@/components/dashboard/MobileDashboard'),
    { ssr: false }
);

export function DashboardContent(props: DashboardContentProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return <MobileDashboard {...props} />;
    }

    return <DashboardPageClient {...props} />;
}
