import { getEmployers } from '@/lib/data/employers';
import { getApprovedReviews } from '@/lib/data/reviews';
import { getSalaries } from '@/lib/data/salaries';
import { ComparePageClient } from './ComparePageClient';

export default async function ComparePage() {
  const [employers, reviews, salaries] = await Promise.all([
    getEmployers(),
    getApprovedReviews(),
    getSalaries(),
  ]);

  return (
    <ComparePageClient
      employers={employers}
      reviews={reviews}
      salaries={salaries}
    />
  );
}
