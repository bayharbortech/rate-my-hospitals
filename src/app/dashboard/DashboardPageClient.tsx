'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { compareDesc } from 'date-fns';
import { formatDate as formatDateUtil, getTimeAgo as getTimeAgoUtil } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  Bell,
  BellOff,
  Building2,
  Edit2,
  Trash2,
  MapPin,
  ExternalLink,
  MessageCircle,
  TrendingUp,
  Calendar,
  FileText,
  Save,
  Bookmark,
  BookmarkCheck,
  Trophy,
} from 'lucide-react';
import Link from 'next/link';
import { Employer, Review } from '@/lib/types';
import { RatingStars } from '@/components/reviews/RatingStars';
import { UserReviewCard } from '@/components/dashboard/UserReviewCard';
import { Top40Dashboard } from '@/components/dashboard/Top40Dashboard';
import { createClient } from '@/lib/supabase/client';
import { useSavedStore } from '@/stores/useSavedStore';

interface ReviewWithEmployerName extends Review {
  employer: { name: string };
}

interface DashboardPageClientProps {
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

// Initialize saved hospitals from localStorage or with empty array
const getInitialSavedHospitals = (): SavedHospital[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(SAVED_HOSPITALS_KEY);
  return saved ? JSON.parse(saved) : [];
};

export function DashboardPageClient({ employers, reviews, userReviews, userProfile }: DashboardPageClientProps) {
  const [activeTab, setActiveTab] = useState('reviews');
  const [savedHospitals, setSavedHospitals] = useState<SavedHospital[]>([]);
  const { savedReviewIds, toggleReview } = useSavedStore();
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHospitalsData = JSON.parse(localStorage.getItem(SAVED_HOSPITALS_KEY) || '[]');
      setSavedHospitals(savedHospitalsData);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && savedHospitals.length > 0) {
      localStorage.setItem(SAVED_HOSPITALS_KEY, JSON.stringify(savedHospitals));
    }
  }, [savedHospitals]);

  const { data: recentQuestions = [] } = useQuery<QuestionFromDB[]>({
    queryKey: ['recent-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, employer_id, question_text, created_at')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
  });

  // Create employer map for quick lookups
  const employerMap = useMemo(() => {
    const map = new Map<string, Employer>();
    employers.forEach((emp) => map.set(emp.id, emp));
    return map;
  }, [employers]);

  // userReviews are passed in from server (real data from DB)

  // Get saved reviews with employer data
  const savedReviewsWithData = useMemo(() => {
    return savedReviewIds.map(reviewId => {
      const review = reviews.find(r => r.id === reviewId);
      if (!review) return null;
      const employer = employerMap.get(review.employer_id);
      return { review, employer };
    }).filter((item): item is { review: Review; employer: Employer | undefined } => item !== null);
  }, [savedReviewIds, reviews, employerMap]);

  // Get employer data for saved hospitals
  const savedHospitalsWithData = useMemo(() => {
    return savedHospitals.map(saved => {
      const employer = employerMap.get(saved.employer_id);
      return { ...saved, employer };
    }).filter(s => s.employer);
  }, [savedHospitals, employerMap]);

  // Generate activity feed
  const activityFeed = useMemo(() => {
    const activities: {
      id: string;
      type: 'review' | 'question' | 'answer';
      employerName: string;
      employerId: string;
      preview: string;
      date: string;
    }[] = [];

    // Add recent reviews from followed hospitals
    savedHospitals.filter(s => s.notify_new_reviews).forEach(saved => {
      const hospitalReviews = reviews.filter(r => r.employer_id === saved.employer_id);
      const employer = employerMap.get(saved.employer_id);
      hospitalReviews.slice(0, 2).forEach(review => {
        activities.push({
          id: review.id,
          type: 'review',
          employerName: employer?.name || 'Unknown',
          employerId: saved.employer_id,
          preview: review.title,
          date: review.created_at
        });
      });
    });

    // Add recent questions from database
    recentQuestions.forEach(question => {
      const employer = employerMap.get(question.employer_id);
      activities.push({
        id: question.id,
        type: 'question',
        employerName: employer?.name || 'Unknown',
        employerId: question.employer_id,
        preview: question.question_text.length > 80
          ? question.question_text.slice(0, 80) + '...'
          : question.question_text,
        date: question.created_at
      });
    });

    return activities
      .sort((a, b) => compareDesc(new Date(a.date), new Date(b.date)))
      .slice(0, 10);
  }, [savedHospitals, recentQuestions, reviews, employerMap]);

  const toggleNotifications = (hospitalId: string) => {
    setSavedHospitals(prev => prev.map(h =>
      h.id === hospitalId
        ? { ...h, notify_new_reviews: !h.notify_new_reviews }
        : h
    ));
  };

  const removeFromSaved = (hospitalId: string) => {
    const newSaved = savedHospitals.filter(h => h.id !== hospitalId);
    setSavedHospitals(newSaved);
    localStorage.setItem(SAVED_HOSPITALS_KEY, JSON.stringify(newSaved));
  };

  const removeReviewFromSaved = (reviewId: string) => {
    toggleReview(reviewId);
  };

  const startEditingNotes = (hospitalId: string, currentNotes: string) => {
    setEditingNotes(hospitalId);
    setNoteText(currentNotes || '');
  };

  const saveNotes = (hospitalId: string) => {
    setSavedHospitals(prev => prev.map(h =>
      h.id === hospitalId
        ? { ...h, notes: noteText }
        : h
    ));
    setEditingNotes(null);
    setNoteText('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'revision_requested':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100"><Edit2 className="w-3 h-3 mr-1" /> Revision Requested</Badge>;
      default:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    }
  };

  const formatDate = (dateString: string) => formatDateUtil(dateString, 'short');

  const getTimeAgo = getTimeAgoUtil;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userProfile.display_name || userProfile.email}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userReviews.length}</p>
                <p className="text-xs text-muted-foreground">Reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedHospitals.length}</p>
                <p className="text-xs text-muted-foreground">Hospitals</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bookmark className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedReviewIds.length}</p>
                <p className="text-xs text-muted-foreground">Saved Reviews</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{savedHospitals.filter(h => h.notify_new_reviews).length}</p>
                <p className="text-xs text-muted-foreground">Following</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{userReviews.reduce((acc, r) => acc + r.helpful_votes_up, 0)}</p>
                <p className="text-xs text-muted-foreground">Helpful</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="top40" className="gap-2">
              <Trophy className="w-4 h-4" /> Top 40
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <FileText className="w-4 h-4" /> My Reviews
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <Heart className="w-4 h-4" /> Hospitals
            </TabsTrigger>
            <TabsTrigger value="savedReviews" className="gap-2">
              <Bookmark className="w-4 h-4" /> Saved
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Bell className="w-4 h-4" /> Activity
            </TabsTrigger>
          </TabsList>

          {/* Top 40 Tab */}
          <TabsContent value="top40">
            <Top40Dashboard />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Reviews</CardTitle>
                    <CardDescription>Reviews you&apos;ve submitted for hospitals</CardDescription>
                  </div>
                  <Link href="/employers">
                    <Button className="gap-2">
                      <Edit2 className="w-4 h-4" /> Write Review
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {userReviews.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">You haven&apos;t submitted any reviews yet.</p>
                    <Link href="/employers">
                      <Button variant="outline">Browse Hospitals</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userReviews.map(review => (
                      <UserReviewCard
                        key={review.id}
                        review={review}
                        getStatusBadge={getStatusBadge}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Hospitals Tab */}
          <TabsContent value="saved">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Saved Hospitals</CardTitle>
                    <CardDescription>Hospitals you&apos;re tracking for job opportunities</CardDescription>
                  </div>
                  <Link href="/employers">
                    <Button variant="outline" className="gap-2">
                      <Building2 className="w-4 h-4" /> Browse More
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedHospitalsWithData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    <Heart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">You haven&apos;t saved any hospitals yet.</p>
                    <Link href="/employers">
                      <Button variant="outline">Browse Hospitals</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedHospitalsWithData.map(saved => (
                      <div key={saved.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/employers/${saved.employer_id}`} className="font-semibold text-lg hover:text-teal-600">
                                {saved.employer?.name}
                              </Link>
                              {saved.employer?.rating_overall && (
                                <Badge variant="secondary" className="gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {saved.employer.rating_overall.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-4 h-4" />
                              <span>{saved.employer?.city}, {saved.employer?.state}</span>
                              <span className="text-slate-300">|</span>
                              <Calendar className="w-4 h-4" />
                              <span>Saved {getTimeAgo(saved.saved_at)}</span>
                            </div>

                            {/* Notes Section */}
                            {editingNotes === saved.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={noteText}
                                  onChange={(e) => setNoteText(e.target.value)}
                                  placeholder="Add notes about this hospital..."
                                  className="min-h-[80px]"
                                />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => saveNotes(saved.id)} className="gap-1">
                                    <Save className="w-3 h-3" /> Save
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                                <div className="flex items-start justify-between">
                                  <p className="text-sm text-slate-600 italic">
                                    {saved.notes || 'No notes added yet...'}
                                  </p>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0"
                                    onClick={() => startEditingNotes(saved.id, saved.notes || '')}
                                  >
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2">
                              {saved.employer?.magnet_status && (
                                <Badge variant="outline" className="text-amber-600 border-amber-200">Magnet</Badge>
                              )}
                              {saved.employer?.union && (
                                <Badge variant="outline" className="text-blue-600 border-blue-200">Union</Badge>
                              )}
                              {saved.employer?.new_grad_friendly && (
                                <Badge variant="outline" className="text-green-600 border-green-200">New Grad</Badge>
                              )}
                              {saved.employer?.avg_hourly_rate && (
                                <Badge variant="outline" className="text-teal-600 border-teal-200">
                                  ~${saved.employer.avg_hourly_rate}/hr
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Right Side Actions */}
                          <div className="flex flex-col items-end gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {saved.notify_new_reviews ? (
                                  <span className="flex items-center gap-1 text-teal-600">
                                    <Bell className="w-4 h-4" /> Notifications on
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <BellOff className="w-4 h-4" /> Notifications off
                                  </span>
                                )}
                              </span>
                              <Switch
                                checked={saved.notify_new_reviews}
                                onCheckedChange={() => toggleNotifications(saved.id)}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Link href={`/employers/${saved.employer_id}`}>
                                <Button size="sm" variant="outline" className="gap-1">
                                  View <ExternalLink className="w-3 h-3" />
                                </Button>
                              </Link>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => removeFromSaved(saved.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Saved Reviews Tab */}
          <TabsContent value="savedReviews">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Saved Reviews</CardTitle>
                    <CardDescription>Reviews you&apos;ve bookmarked for later reference</CardDescription>
                  </div>
                  <Link href="/reviews">
                    <Button variant="outline" className="gap-2">
                      <FileText className="w-4 h-4" /> Browse Reviews
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {savedReviewsWithData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    <Bookmark className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-2">You haven&apos;t saved any reviews yet.</p>
                    <p className="text-sm mb-4">Click the bookmark icon on any review to save it here.</p>
                    <Link href="/reviews">
                      <Button variant="outline">Browse Reviews</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedReviewsWithData.map(({ review, employer }) => (
                      <div key={review.id} className="border rounded-lg p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div>
                            <Link
                              href={`/employers/${review.employer_id}`}
                              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              {employer?.name || 'Unknown Hospital'}
                            </Link>
                            <h4 className="font-semibold text-lg mt-1">{review.title}</h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <span>{review.position_type}</span>
                              <span>•</span>
                              <span>{review.department}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <RatingStars rating={review.rating_overall} showValue />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-amber-500 hover:text-red-500 hover:bg-red-50"
                              onClick={() => removeReviewFromSaved(review.id)}
                              title="Remove from saved"
                            >
                              <BookmarkCheck className="w-4 h-4 fill-current" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 line-clamp-3 mb-3">
                          {review.review_text}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-4 h-4" /> {review.helpful_votes_up} helpful
                            </span>
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                          <Link href={`/employers/${review.employer_id}`}>
                            <Button size="sm" variant="outline" className="gap-1">
                              View Hospital <ExternalLink className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent activity from hospitals you follow</CardDescription>
              </CardHeader>
              <CardContent>
                {activityFeed.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                    <p className="mb-4">No recent activity. Save some hospitals and enable notifications!</p>
                    <Link href="/employers">
                      <Button variant="outline">Browse Hospitals</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityFeed.map((activity, index) => (
                      <Link
                        key={`${activity.id}-${index}`}
                        href={`/employers/${activity.employerId}${activity.type === 'question' ? '?tab=qa' : ''}`}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border"
                      >
                        <div className={`p-2 rounded-lg ${
                          activity.type === 'review'
                            ? 'bg-teal-100 text-teal-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {activity.type === 'review' ? (
                            <FileText className="w-5 h-5" />
                          ) : (
                            <MessageCircle className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">
                            New {activity.type === 'review' ? 'review' : 'question'} at{' '}
                            <span className="text-teal-600">{activity.employerName}</span>
                          </p>
                          <p className="text-sm text-muted-foreground truncate">{activity.preview}</p>
                        </div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                          {getTimeAgo(activity.date)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
