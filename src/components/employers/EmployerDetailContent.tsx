'use client';

import dynamic from 'next/dynamic';
import { Employer, Review, Salary, Interview } from '@/lib/types';
import { useIsMobile } from '@/hooks/useIsMobile';
import { RatingStars } from '@/components/reviews/RatingStars';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Globe, Phone, Award, Users, GraduationCap, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { HospitalBadges } from '@/components/employers/HospitalBadges';
import { EmployerActions } from '@/components/employers/EmployerActions';
import { EmployerTabs } from '@/components/employers/EmployerTabs';

const MobileEmployerDetail = dynamic(() => import('@/components/employers/MobileEmployerDetail'), { ssr: false });

interface EmployerDetailContentProps {
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

function RatingRow({ label, rating }: { label: string; rating: number }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-sm">
                <span>{label}</span>
                <span className="font-medium">{rating > 0 ? rating.toFixed(1) : 'N/A'}</span>
            </div>
            <Progress value={rating * 20} className="h-2" />
        </div>
    );
}

export function EmployerDetailContent({
    employer,
    reviews,
    salaries,
    interviews,
    ratingBreakdown,
    defaultTab,
}: EmployerDetailContentProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobileEmployerDetail
                employer={employer}
                reviews={reviews}
                salaries={salaries}
                interviews={interviews}
                ratingBreakdown={ratingBreakdown}
                defaultTab={defaultTab}
            />
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            {/* Header Banner */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{employer.name}</h1>
                                <Badge variant="secondary" className="text-base capitalize">{employer.type}</Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {employer.address}, {employer.city}, {employer.state} {employer.zip_code}
                                </div>
                                {employer.website && (
                                    <a href={employer.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                        <Globe className="h-4 w-4" />
                                        Website
                                    </a>
                                )}
                                {employer.phone && (
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        {employer.phone}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold text-primary">{employer.rating_overall?.toFixed(1)}</span>
                                        <div className="flex flex-col">
                                            <RatingStars rating={employer.rating_overall || 0} />
                                            <span className="text-sm text-muted-foreground">{employer.review_count} reviews</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {employer.magnet_status && (
                                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
                                            <Award className="w-3 h-3" /> Magnet Designated
                                        </Badge>
                                    )}
                                    {employer.union && (
                                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 gap-1">
                                            <Users className="w-3 h-3" /> Union Hospital
                                        </Badge>
                                    )}
                                    {employer.new_grad_friendly && (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                                            <GraduationCap className="w-3 h-3" /> New Grad Friendly
                                        </Badge>
                                    )}
                                    {employer.avg_hourly_rate && (
                                        <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-100 gap-1">
                                            <DollarSign className="w-3 h-3" /> ~${employer.avg_hourly_rate}/hr avg
                                        </Badge>
                                    )}
                                </div>
                                <HospitalBadges badges={employer.badges || []} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <Link href={`/reviews/submit?employer=${employer.id}`}>
                                <Button className="w-full" size="lg">Write a Review</Button>
                            </Link>
                            <EmployerActions employerId={employer.id} employerName={employer.name} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Rating Breakdown</h3>
                            <div className="space-y-4">
                                <RatingRow label="Staffing" rating={ratingBreakdown.staffing} />
                                <RatingRow label="Safety" rating={ratingBreakdown.safety} />
                                <RatingRow label="Culture" rating={ratingBreakdown.culture} />
                                <RatingRow label="Management" rating={ratingBreakdown.management} />
                                <RatingRow label="Pay & Benefits" rating={ratingBreakdown.pay_benefits} />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Facility Info</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Health System</span>
                                    <span className="font-medium">{employer.health_system || 'Independent'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Teaching Status</span>
                                    <span className="font-medium capitalize">{employer.teaching_status || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Bed Count</span>
                                    <span className="font-medium">{employer.bed_count || 'N/A'}</span>
                                </div>
                                {employer.specialties && employer.specialties.length > 0 && (
                                    <div className="py-2">
                                        <span className="text-muted-foreground block mb-2">Specialties</span>
                                        <div className="flex flex-wrap gap-1">
                                            {employer.specialties.map(spec => (
                                                <Badge key={spec} variant="outline" className="text-xs">{spec}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg border shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <p className="text-2xl font-bold text-teal-600">{reviews.length}</p>
                                    <p className="text-xs text-muted-foreground">Reviews</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <p className="text-2xl font-bold text-teal-600">{salaries.length}</p>
                                    <p className="text-xs text-muted-foreground">Salaries</p>
                                </div>
                                <div className="text-center p-3 bg-slate-50 rounded-lg">
                                    <p className="text-2xl font-bold text-teal-600">{interviews.length}</p>
                                    <p className="text-xs text-muted-foreground">Interviews</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <EmployerTabs
                            employerId={employer.id}
                            employerName={employer.name}
                            reviews={reviews}
                            salaries={salaries}
                            interviews={interviews}
                            defaultTab={defaultTab}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
