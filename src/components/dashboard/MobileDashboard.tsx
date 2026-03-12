'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { formatDate as formatDateUtil, getTimeAgo as getTimeAgoUtil } from '@/lib/constants';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Star, Clock, CheckCircle, XCircle, Heart, Bell,
    Building2, Edit2, Trash2, MapPin, ExternalLink,
    MessageCircle, TrendingUp, FileText, Bookmark,
    BookmarkCheck, Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Employer, Review } from '@/lib/types';
import { RatingStars } from '@/components/reviews/RatingStars';
import { UserReviewCard } from '@/components/dashboard/UserReviewCard';
import { Top40Dashboard } from '@/components/dashboard/Top40Dashboard';
import { createClient } from '@/lib/supabase/client';
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation';
import { useSavedStore } from '@/stores/useSavedStore';

interface ReviewWithEmployerName extends Review {
    employer: { name: string };
}

interface MobileDashboardProps {
    employers: Employer[];
    reviews: Review[];
    userReviews: ReviewWithEmployerName[];
    userProfile: { email: string; display_name: string | null };
}

const SAVED_HOSPITALS_KEY = 'rate-my-hospitals-saved-hospitals';

interface SavedHospital {
    id: string;
    employer_id: string;
    saved_at: string;
    notes?: string;
    notify_new_reviews: boolean;
}

interface QuestionFromDB {
    id: string;
    employer_id: string;
    question_text: string;
    created_at: string;
}

type TabId = 'top40' | 'reviews' | 'saved' | 'savedReviews' | 'activity';

const TABS: { id: TabId; label: string; icon: typeof Trophy }[] = [
    { id: 'top40', label: 'Top 40', icon: Trophy },
    { id: 'reviews', label: 'Reviews', icon: FileText },
    { id: 'saved', label: 'Hospitals', icon: Heart },
    { id: 'savedReviews', label: 'Saved', icon: Bookmark },
    { id: 'activity', label: 'Activity', icon: Bell },
];

export default function MobileDashboard({ employers, reviews, userReviews, userProfile }: MobileDashboardProps) {
    const [activeTab, setActiveTab] = useState<TabId>('reviews');
    const [savedHospitals, setSavedHospitals] = useState<SavedHospital[]>([]);
    const { savedReviewIds, toggleReview } = useSavedStore();
    const [recentQuestions, setRecentQuestions] = useState<QuestionFromDB[]>([]);
    const supabase = createClient();

    const tabIds = TABS.map(t => t.id);
    const goNextTab = useCallback(() => {
        const idx = tabIds.indexOf(activeTab);
        if (idx < tabIds.length - 1) setActiveTab(tabIds[idx + 1]);
    }, [activeTab, tabIds]);
    const goPrevTab = useCallback(() => {
        const idx = tabIds.indexOf(activeTab);
        if (idx > 0) setActiveTab(tabIds[idx - 1]);
    }, [activeTab, tabIds]);
    const swipeRef = useSwipeNavigation({ onSwipeLeft: goNextTab, onSwipeRight: goPrevTab });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setSavedHospitals(JSON.parse(localStorage.getItem(SAVED_HOSPITALS_KEY) || '[]'));
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined' && savedHospitals.length > 0) {
            localStorage.setItem(SAVED_HOSPITALS_KEY, JSON.stringify(savedHospitals));
        }
    }, [savedHospitals]);

    useEffect(() => {
        const fetchQuestions = async () => {
            const { data } = await supabase
                .from('questions')
                .select('id, employer_id, question_text, created_at')
                .order('created_at', { ascending: false })
                .limit(5);
            if (data) setRecentQuestions(data);
        };
        fetchQuestions();
    }, [supabase]);

    const employerMap = useMemo(() => {
        const map = new Map<string, Employer>();
        employers.forEach(emp => map.set(emp.id, emp));
        return map;
    }, [employers]);

    const savedReviewsWithData = useMemo(() => {
        return savedReviewIds.map(id => {
            const review = reviews.find(r => r.id === id);
            if (!review) return null;
            return { review, employer: employerMap.get(review.employer_id) };
        }).filter((item): item is { review: Review; employer: Employer | undefined } => item !== null);
    }, [savedReviewIds, reviews, employerMap]);

    const savedHospitalsWithData = useMemo(() => {
        return savedHospitals.map(saved => ({
            ...saved, employer: employerMap.get(saved.employer_id),
        })).filter(s => s.employer);
    }, [savedHospitals, employerMap]);

    const activityFeed = useMemo(() => {
        const activities: { id: string; type: 'review' | 'question'; employerName: string; employerId: string; preview: string; date: string }[] = [];
        savedHospitals.filter(s => s.notify_new_reviews).forEach(saved => {
            reviews.filter(r => r.employer_id === saved.employer_id).slice(0, 2).forEach(review => {
                activities.push({ id: review.id, type: 'review', employerName: employerMap.get(saved.employer_id)?.name || 'Unknown', employerId: saved.employer_id, preview: review.title, date: review.created_at });
            });
        });
        recentQuestions.forEach(q => {
            activities.push({ id: q.id, type: 'question', employerName: employerMap.get(q.employer_id)?.name || 'Unknown', employerId: q.employer_id, preview: q.question_text.slice(0, 60), date: q.created_at });
        });
        return activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    }, [savedHospitals, recentQuestions, reviews, employerMap]);

    const removeFromSaved = (id: string) => {
        const updated = savedHospitals.filter(h => h.id !== id);
        setSavedHospitals(updated);
        localStorage.setItem(SAVED_HOSPITALS_KEY, JSON.stringify(updated));
    };

    const removeReviewFromSaved = (reviewId: string) => {
        toggleReview(reviewId);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved': return <Badge className="bg-green-600 text-xs"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
            case 'rejected': return <Badge variant="destructive" className="text-xs"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            case 'revision_requested': return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs"><Edit2 className="w-3 h-3 mr-1" /> Revision</Badge>;
            default: return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
        }
    };

    const formatDate = (d: string) => formatDateUtil(d, 'short');

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-background">
            {/* Compact header */}
            <div className="bg-background border-b px-4 py-3">
                <h1 className="text-lg font-bold">My Dashboard</h1>
                <p className="text-xs text-muted-foreground truncate">{userProfile.display_name || userProfile.email}</p>
            </div>

            {/* Quick stats row */}
            <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
                {[
                    { value: userReviews.length, label: 'Reviews', color: 'bg-teal-100 text-teal-600' },
                    { value: savedHospitals.length, label: 'Saved', color: 'bg-pink-100 text-pink-600' },
                    { value: savedReviewIds.length, label: 'Bookmarks', color: 'bg-amber-100 text-amber-600' },
                    { value: userReviews.reduce((a, r) => a + r.helpful_votes_up, 0), label: 'Helpful', color: 'bg-green-100 text-green-600' },
                ].map(stat => (
                    <div key={stat.label} className="flex-shrink-0 bg-background rounded-lg border px-3 py-2 text-center min-w-[70px]">
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Scrollable tab bar */}
            <div className="sticky top-16 z-40 bg-background border-b overflow-x-auto scrollbar-hide">
                <div className="flex">
                    {TABS.map(tab => {
                        const active = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    active ? 'border-teal-600 text-teal-600' : 'border-transparent text-muted-foreground'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab content */}
            <div ref={swipeRef} className="px-4 py-4">
                {activeTab === 'top40' && <Top40Dashboard />}

                {activeTab === 'reviews' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">My Reviews</h2>
                            <Link href="/employers"><Button size="sm" className="gap-1"><Edit2 className="w-3 h-3" /> Write</Button></Link>
                        </div>
                        {userReviews.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No reviews yet.</p>
                                <Link href="/employers"><Button variant="outline" size="sm" className="mt-3">Browse Hospitals</Button></Link>
                            </div>
                        ) : (
                            userReviews.map(review => (
                                <UserReviewCard key={review.id} review={review} getStatusBadge={getStatusBadge} formatDate={formatDate} />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'saved' && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h2 className="font-semibold">Saved Hospitals</h2>
                            <Link href="/employers"><Button size="sm" variant="outline" className="gap-1"><Building2 className="w-3 h-3" /> Browse</Button></Link>
                        </div>
                        {savedHospitalsWithData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Heart className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No saved hospitals.</p>
                            </div>
                        ) : (
                            savedHospitalsWithData.map(saved => (
                                <Link key={saved.id} href={`/employers/${saved.employer_id}`} className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{saved.employer?.name}</p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <MapPin className="w-3 h-3" />{saved.employer?.city}, {saved.employer?.state}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {saved.employer?.rating_overall && (
                                            <Badge variant="secondary" className="gap-1 text-xs">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                {saved.employer.rating_overall.toFixed(1)}
                                            </Badge>
                                        )}
                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400" onClick={e => { e.preventDefault(); removeFromSaved(saved.id); }}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'savedReviews' && (
                    <div className="space-y-3">
                        <h2 className="font-semibold">Saved Reviews</h2>
                        {savedReviewsWithData.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Bookmark className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No saved reviews.</p>
                            </div>
                        ) : (
                            savedReviewsWithData.map(({ review, employer }) => (
                                <div key={review.id} className="bg-card rounded-lg border p-3">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <div className="min-w-0">
                                            <p className="text-xs text-teal-600 font-medium truncate">{employer?.name || 'Unknown'}</p>
                                            <p className="font-medium text-sm">{review.title}</p>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <RatingStars rating={review.rating_overall} />
                                            <Button size="icon" variant="ghost" className="h-7 w-7 text-amber-500" onClick={() => removeReviewFromSaved(review.id)}>
                                                <BookmarkCheck className="w-3.5 h-3.5 fill-current" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{review.review_text}</p>
                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{review.helpful_votes_up} helpful</span>
                                        <span>{formatDate(review.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="space-y-3">
                        <h2 className="font-semibold">Activity Feed</h2>
                        {activityFeed.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                                <p>No recent activity.</p>
                            </div>
                        ) : (
                            activityFeed.map((activity, i) => (
                                <Link key={`${activity.id}-${i}`} href={`/employers/${activity.employerId}`} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                                    <div className={`p-1.5 rounded-lg ${activity.type === 'review' ? 'bg-teal-100 text-teal-600' : 'bg-blue-100 text-blue-600'}`}>
                                        {activity.type === 'review' ? <FileText className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium">
                                            New {activity.type} at <span className="text-teal-600">{activity.employerName}</span>
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">{activity.preview}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{getTimeAgoUtil(activity.date)}</span>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
