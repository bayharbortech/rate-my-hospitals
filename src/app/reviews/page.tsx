import { getEmployers } from '@/lib/data/employers';
import { getApprovedReviews, getReviewDepartments } from '@/lib/data/reviews';
import { ReviewsPageClient } from './ReviewsPageClient';

export default async function ReviewsPage() {
  const [reviews, employers, departments] = await Promise.all([
    getApprovedReviews(),
    getEmployers(),
    getReviewDepartments(),
  ]);

  return (
    <ReviewsPageClient
      reviews={reviews}
      employers={employers}
      departments={departments}
    />
  );
}
