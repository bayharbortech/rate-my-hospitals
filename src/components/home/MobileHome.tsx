'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
    Stethoscope, PenSquare, DollarSign, ArrowRightLeft,
    Star, ChevronRight, Heart,
} from 'lucide-react';
import { Employer, Review } from '@/lib/types';
import { TrendingHospital } from '@/lib/data/trending';
import { EmployerCard } from '@/components/employers/EmployerCard';
import { ReviewCard } from '@/components/reviews/ReviewCard';
import { HeroSearch } from '@/components/search/HeroSearch';

interface MobileHomeProps {
    featuredEmployers: Employer[];
    recentReviews: Review[];
    trendingHospitals: TrendingHospital[];
}

const QUICK_ACTIONS = [
    { href: '/employers', label: 'Hospitals', icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
    { href: '/reviews/submit', label: 'Review', icon: PenSquare, color: 'bg-blue-50 text-blue-600' },
    { href: '/salaries', label: 'Salaries', icon: DollarSign, color: 'bg-green-50 text-green-600' },
    { href: '/compare', label: 'Compare', icon: ArrowRightLeft, color: 'bg-purple-50 text-purple-600' },
];

export default function MobileHome({ featuredEmployers, recentReviews, trendingHospitals }: MobileHomeProps) {
    return (
        <div className="flex flex-col">
            {/* Compact Hero */}
            <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white px-4 pt-8 pb-12">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1 mb-4 text-xs">
                        <Heart className="w-3 h-3 text-rose-400" />
                        <span>By nurses, for nurses</span>
                    </div>
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">
                        Find Where You
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-cyan-300">
                            Thrive
                        </span>
                    </h1>
                    <p className="text-sm text-teal-100/80 mb-6">
                        Anonymous, honest reviews from real nurses.
                    </p>
                </div>
                <HeroSearch />
                {trendingHospitals.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <span className="text-teal-200/50 text-xs">Trending:</span>
                        {trendingHospitals.map(h => (
                            <Link
                                key={h.id}
                                href={`/employers/${h.id}`}
                                className="text-xs text-white/70 bg-white/10 px-2.5 py-0.5 rounded-full"
                            >
                                {h.name}
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            {/* Quick Actions */}
            <section className="px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-4 gap-2">
                    {QUICK_ACTIONS.map(action => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className="flex flex-col items-center gap-1.5 p-3 bg-background rounded-xl shadow-sm border"
                        >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                                <action.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-medium text-foreground">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Top Rated -- horizontal scroll */}
            {featuredEmployers.length > 0 && (
                <section className="mt-8 px-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-teal-600" />
                            <h2 className="text-lg font-bold">Top Rated</h2>
                        </div>
                        <Link href="/employers" className="text-xs text-teal-600 font-medium flex items-center gap-0.5">
                            View all <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
                        {featuredEmployers.map((employer, i) => (
                            <div key={employer.id} className="min-w-[280px] snap-start relative">
                                {i === 0 && (
                                    <div className="absolute -top-2 -right-2 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full z-10 shadow">
                                        #1
                                    </div>
                                )}
                                <EmployerCard employer={employer} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Recent Reviews -- stacked */}
            {recentReviews.length > 0 && (
                <section className="mt-8 px-4 pb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold">Latest Reviews</h2>
                        <Link href="/reviews" className="text-xs text-teal-600 font-medium flex items-center gap-0.5">
                            More <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentReviews.map(review => (
                            <ReviewCard key={review.id} review={review} />
                        ))}
                    </div>
                </section>
            )}

            {/* Simplified CTA */}
            <section className="px-4 py-8 bg-teal-50 dark:bg-teal-950/30">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Ready to share?</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Your anonymous review helps fellow nurses.
                    </p>
                    <Link href="/reviews/submit">
                        <Button className="w-full">Write a Review</Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
