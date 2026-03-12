'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { RatingBreakdown } from '@/components/reviews/RatingBreakdown';
import { SalaryList } from '@/components/employers/SalaryList';
import { QASection } from '@/components/employers/QASection';
import { InterviewSection } from '@/components/employers/InterviewSection';
import { DepartmentReviews } from '@/components/employers/DepartmentReviews';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Review, Salary, Interview } from '@/lib/types';

interface EmployerTabsProps {
  employerId: string;
  employerName: string;
  reviews: Review[];
  salaries: Salary[];
  interviews: Interview[];
  defaultTab: string;
}

export function EmployerTabs({
  employerId,
  employerName,
  reviews,
  salaries,
  interviews,
  defaultTab
}: EmployerTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || defaultTab;

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'reviews') {
      params.delete('tab');
    } else {
      params.set('tab', value);
    }
    const query = params.toString();
    router.push(`/employers/${employerId}${query ? `?${query}` : ''}`, { scroll: false });
  };

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5 mb-6">
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
        <TabsTrigger value="departments">By Dept</TabsTrigger>
        <TabsTrigger value="salaries">Salaries</TabsTrigger>
        <TabsTrigger value="interviews">Interviews</TabsTrigger>
        <TabsTrigger value="qa">Q&A</TabsTrigger>
      </TabsList>

      <TabsContent value="reviews" className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <Link href={`/reviews/submit?employer=${employerId}`}>
            <Button>Write a Review</Button>
          </Link>
        </div>

        <RatingBreakdown reviews={reviews} />
        <ReviewsList reviews={reviews} employerId={employerId} />
      </TabsContent>

      <TabsContent value="departments" className="space-y-6">
        <DepartmentReviews reviews={reviews} employerName={employerName} />
      </TabsContent>

      <TabsContent value="salaries">
        <SalaryList salaries={salaries} />
      </TabsContent>

      <TabsContent value="interviews">
        <InterviewSection interviews={interviews} employerName={employerName} />
      </TabsContent>

      <TabsContent value="qa">
        <QASection employerId={employerId} employerName={employerName} />
      </TabsContent>
    </Tabs>
  );
}
