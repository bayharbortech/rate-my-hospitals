import { notFound } from 'next/navigation';
import { getEmployerById } from '@/lib/data/employers';
import { getReviewsByEmployerId } from '@/lib/data/reviews';
import { getSalariesByEmployerId } from '@/lib/data/salaries';
import { getInterviewsByEmployerId } from '@/lib/data/interviews';
import { EmployerDetailContent } from '@/components/employers/EmployerDetailContent';

interface PageProps {
    params: Promise<{
        id: string;
    }>;
    searchParams: Promise<{
        tab?: string;
    }>;
}

export default async function EmployerDetailsPage(props: PageProps) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const [employer, employerReviews, employerSalaries, employerInterviews] = await Promise.all([
        getEmployerById(params.id),
        getReviewsByEmployerId(params.id),
        getSalariesByEmployerId(params.id),
        getInterviewsByEmployerId(params.id),
    ]);

    if (!employer) {
        notFound();
    }

    const defaultTab = searchParams.tab || 'reviews';

    const ratingBreakdown = employerReviews.length > 0 ? {
        staffing: employerReviews.reduce((acc, r) => acc + r.rating_staffing, 0) / employerReviews.length,
        safety: employerReviews.reduce((acc, r) => acc + r.rating_safety, 0) / employerReviews.length,
        culture: employerReviews.reduce((acc, r) => acc + r.rating_culture, 0) / employerReviews.length,
        management: employerReviews.reduce((acc, r) => acc + r.rating_management, 0) / employerReviews.length,
        pay_benefits: employerReviews.reduce((acc, r) => acc + r.rating_pay_benefits, 0) / employerReviews.length,
    } : {
        staffing: 0, safety: 0, culture: 0, management: 0, pay_benefits: 0,
    };

    return (
        <EmployerDetailContent
            employer={employer}
            reviews={employerReviews}
            salaries={employerSalaries}
            interviews={employerInterviews}
            ratingBreakdown={ratingBreakdown}
            defaultTab={defaultTab}
        />
    );
}
