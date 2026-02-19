'use client';

import { useState } from 'react';
import { Employer, Review, Salary, Interview } from '@/lib/types';
import { RatingStars } from '@/components/reviews/RatingStars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Award, Users, GraduationCap, DollarSign, Star } from 'lucide-react';
import Link from 'next/link';
import { EmployerActions } from '@/components/employers/EmployerActions';
import { EmployerTabs } from '@/components/employers/EmployerTabs';

interface MobileEmployerDetailProps {
    employer: Employer;
    reviews: Review[];
    salaries: Salary[];
    interviews: Interview[];
    ratingBreakdown: {
        staffing: number;
        safety: number;
        culture: number;
        management: number;
        pay_benefits: number;
    };
    defaultTab: string;
}

type MobileTab = 'overview' | 'reviews' | 'salaries' | 'interviews';

export default function MobileEmployerDetail({
    employer,
    reviews,
    salaries,
    interviews,
    ratingBreakdown,
    defaultTab,
}: MobileEmployerDetailProps) {
    const [activeTab, setActiveTab] = useState<MobileTab>(
        (['reviews', 'salaries', 'interviews'].includes(defaultTab) ? defaultTab : 'overview') as MobileTab
    );

    const tabs: { id: MobileTab; label: string; count?: number }[] = [
        { id: 'overview', label: 'Overview' },
        { id: 'reviews', label: 'Reviews', count: reviews.length },
        { id: 'salaries', label: 'Salaries', count: salaries.length },
        { id: 'interviews', label: 'Interviews', count: interviews.length },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Compact header */}
            <div className="bg-white border-b px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold truncate">{employer.name}</h1>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{employer.city}, {employer.state}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-xl font-bold text-primary">{employer.rating_overall?.toFixed(1)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{employer.review_count} reviews</span>
                    </div>
                </div>

                {/* Feature badges */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {employer.magnet_status && (
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1 text-xs py-0">
                            <Award className="w-3 h-3" /> Magnet
                        </Badge>
                    )}
                    {employer.union && (
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1 text-xs py-0">
                            <Users className="w-3 h-3" /> Union
                        </Badge>
                    )}
                    {employer.new_grad_friendly && (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1 text-xs py-0">
                            <GraduationCap className="w-3 h-3" /> New Grad
                        </Badge>
                    )}
                    {employer.avg_hourly_rate && (
                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 gap-1 text-xs py-0">
                            <DollarSign className="w-3 h-3" /> ~${employer.avg_hourly_rate}/hr
                        </Badge>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mt-3">
                    <Link href={`/reviews/submit?employer=${employer.id}`} className="flex-1">
                        <Button className="w-full" size="sm">Write a Review</Button>
                    </Link>
                    <EmployerActions employerId={employer.id} employerName={employer.name} />
                </div>
            </div>

            {/* Tab bar */}
            <div className="sticky top-16 z-40 bg-white border-b overflow-x-auto scrollbar-hide">
                <div className="flex">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 min-w-0 py-3 px-2 text-center text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-teal-600 text-teal-600'
                                    : 'border-transparent text-muted-foreground hover:text-slate-600'
                            }`}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className="ml-1 text-xs opacity-60">({tab.count})</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            <div className="px-4 py-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        {/* Rating breakdown */}
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="font-semibold mb-3">Rating Breakdown</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Staffing', value: ratingBreakdown.staffing },
                                    { label: 'Safety', value: ratingBreakdown.safety },
                                    { label: 'Culture', value: ratingBreakdown.culture },
                                    { label: 'Management', value: ratingBreakdown.management },
                                    { label: 'Pay & Benefits', value: ratingBreakdown.pay_benefits },
                                ].map(r => (
                                    <div key={r.label} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span>{r.label}</span>
                                            <span className="font-medium">{r.value > 0 ? r.value.toFixed(1) : 'N/A'}</span>
                                        </div>
                                        <Progress value={r.value * 20} className="h-2" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Overall rating */}
                        <div className="bg-white p-4 rounded-lg border text-center">
                            <div className="text-4xl font-bold text-primary mb-1">
                                {employer.rating_overall?.toFixed(1) || 'N/A'}
                            </div>
                            <RatingStars rating={employer.rating_overall || 0} />
                            <p className="text-sm text-muted-foreground mt-1">
                                Based on {employer.review_count} reviews
                            </p>
                        </div>

                        {/* Quick stats */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <p className="text-xl font-bold text-teal-600">{reviews.length}</p>
                                <p className="text-xs text-muted-foreground">Reviews</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <p className="text-xl font-bold text-teal-600">{salaries.length}</p>
                                <p className="text-xs text-muted-foreground">Salaries</p>
                            </div>
                            <div className="text-center p-3 bg-white rounded-lg border">
                                <p className="text-xl font-bold text-teal-600">{interviews.length}</p>
                                <p className="text-xs text-muted-foreground">Interviews</p>
                            </div>
                        </div>

                        {/* Facility info */}
                        <div className="bg-white p-4 rounded-lg border">
                            <h3 className="font-semibold mb-3">Facility Info</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-1.5 border-b">
                                    <span className="text-muted-foreground">Type</span>
                                    <span className="font-medium capitalize">{employer.type}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b">
                                    <span className="text-muted-foreground">Health System</span>
                                    <span className="font-medium">{employer.health_system || 'Independent'}</span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b">
                                    <span className="text-muted-foreground">Teaching</span>
                                    <span className="font-medium capitalize">{employer.teaching_status || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-1.5">
                                    <span className="text-muted-foreground">Beds</span>
                                    <span className="font-medium">{employer.bed_count || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab !== 'overview' && (
                    <EmployerTabs
                        employerId={employer.id}
                        employerName={employer.name}
                        reviews={reviews}
                        salaries={salaries}
                        interviews={interviews}
                        defaultTab={activeTab}
                    />
                )}
            </div>
        </div>
    );
}
