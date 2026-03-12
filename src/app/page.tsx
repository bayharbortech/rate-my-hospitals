// Home page – server component that fetches featured employers, reviews, and trending data
import { getFeaturedEmployers } from '@/lib/data/employers';
import { getRecentReviews, getFeaturedReview } from '@/lib/data/reviews';
import { getTrendingHospitals } from '@/lib/data/trending';
import { HomePageContent } from '@/components/home/HomePageContent';

export default async function Home() {
  const [featuredEmployers, recentReviews, featuredTestimonial, trendingHospitals] = await Promise.all([
    getFeaturedEmployers(3),
    getRecentReviews(3),
    getFeaturedReview(),
    getTrendingHospitals(3, 30),
  ]);

  return (
    <HomePageContent
      featuredEmployers={featuredEmployers}
      recentReviews={recentReviews}
      featuredTestimonial={featuredTestimonial}
      trendingHospitals={trendingHospitals}
    />
  );
}
