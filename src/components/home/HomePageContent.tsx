'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Star, MessageSquare, ChevronRight, Quote, Heart, Stethoscope,
} from 'lucide-react';
import { Employer, Review } from '@/lib/types';
import { TrendingHospital } from '@/lib/data/trending';
import { EmployerCard } from '@/components/employers/EmployerCard';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { HeroSearch } from '@/components/search/HeroSearch';
import { StatsSection, TrustBadges } from '@/components/home/StatsSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { WhyTrustUs } from '@/components/home/WhyTrustUs';
import { CTASection } from '@/components/home/CTASection';
import { useIsMobile } from '@/hooks/useIsMobile';

const MobileHome = dynamic(() => import('@/components/home/MobileHome'), { ssr: false });

interface HomePageContentProps {
    featuredEmployers: Employer[];
    recentReviews: Review[];
    featuredTestimonial: Review | null;
    trendingHospitals: TrendingHospital[];
}

export function HomePageContent({
    featuredEmployers,
    recentReviews,
    featuredTestimonial,
    trendingHospitals,
}: HomePageContentProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobileHome
                featuredEmployers={featuredEmployers}
                recentReviews={recentReviews}
                trendingHospitals={trendingHospitals}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white py-24 md:py-36 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="hero-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                <path d="M50 0 L50 40 M30 20 L70 20" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
                                <circle cx="50" cy="20" r="4" fill="currentColor" opacity="0.3" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#hero-pattern)" />
                    </svg>
                </div>

                <div className="absolute top-20 left-10 w-20 h-20 bg-teal-500/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-20 right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full blur-xl"></div>

                <div className="container relative z-10 mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
                            <Heart className="w-4 h-4 text-rose-400" />
                            <span className="text-sm font-medium">By nurses, for nurses</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                            Find Where You
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                                Thrive
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-teal-100/80 mb-12 max-w-2xl mx-auto leading-relaxed">
                            Anonymous, honest reviews from real nurses. Discover hospitals that value
                            their staff before you sign the contract.
                        </p>

                        <div className="max-w-2xl mx-auto">
                            <HeroSearch />
                            <div className="mt-6 flex flex-wrap justify-center gap-3">
                                <span className="text-teal-200/60 text-sm">Trending:</span>
                                {trendingHospitals.map((hospital) => (
                                    <Link
                                        key={hospital.id}
                                        href={`/employers/${hospital.id}`}
                                        className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                                        title={`${hospital.recentReviewCount} recent reviews`}
                                    >
                                        {hospital.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                        <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" className="fill-background" />
                    </svg>
                </div>
            </section>

            <StatsSection />
            <TrustBadges />
            <HowItWorks />

            {/* Featured Testimonial */}
            <section className="py-20 bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 opacity-5">
                    <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="quote-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                <text x="10" y="40" fontSize="40" fill="currentColor">&quot;</text>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#quote-pattern)" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <Quote className="w-16 h-16 mx-auto mb-8 text-teal-400 opacity-50" />
                        <blockquote className="text-2xl md:text-3xl font-medium leading-relaxed mb-8 text-slate-100">
                            &quot;{featuredTestimonial?.review_text?.slice(0, 200) || "This platform helped me find a hospital that actually values work-life balance. The reviews were spot-on about the supportive management and reasonable patient ratios."}...&quot;
                        </blockquote>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <div className="font-semibold">Anonymous RN</div>
                                <div className="text-sm text-slate-400">ICU Nurse, Southern California</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <WhyTrustUs />

            {/* Featured Employers */}
            <section className="py-20 bg-slate-50 dark:bg-muted/40">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-3 py-1 text-sm font-medium mb-4">
                                <Star className="w-4 h-4" />
                                Top Rated
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Highest Rated Hospitals</h2>
                            <p className="text-lg text-muted-foreground">Where nurses report the best experiences</p>
                        </div>
                        <Link href="/employers">
                            <Button variant="outline" className="gap-2">
                                View All Hospitals
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredEmployers.map((employer, index) => (
                            <div key={employer.id} className="relative">
                                {index === 0 && (
                                    <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">
                                        #1 Rated
                                    </div>
                                )}
                                <EmployerCard employer={employer} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Recent Reviews */}
            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mb-4">
                                <MessageSquare className="w-4 h-4" />
                                Fresh Insights
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-2">Latest Reviews</h2>
                            <p className="text-lg text-muted-foreground">What nurses are saying this week</p>
                        </div>
                        <Link href="/reviews">
                            <Button variant="outline" className="gap-2">
                                Read More Reviews
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recentReviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </div>
            </section>

            <CTASection />
        </div>
    );
}
