'use client';

import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Video,
  Users,
  Phone,
  Building2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  CheckCircle,
  XCircle,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { Interview } from '@/lib/types';

interface InterviewSectionProps {
  interviews: Interview[];
  employerName: string;
}

export function InterviewSection({ interviews, employerName }: InterviewSectionProps) {
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set());
  const [filterPosition, setFilterPosition] = useState<string>('all');

  // Get unique positions for filter
  const positions = useMemo(() => {
    const posSet = new Set(interviews.map(i => i.position));
    return Array.from(posSet);
  }, [interviews]);

  const filteredInterviews = useMemo(() => {
    if (filterPosition === 'all') return interviews;
    return interviews.filter(i => i.position === filterPosition);
  }, [interviews, filterPosition]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = interviews.length;
    const offerRate = total > 0
      ? Math.round((interviews.filter(i => i.offer_received).length / total) * 100)
      : 0;
    const avgDifficulty = total > 0
      ? (interviews.reduce((acc, i) => acc + i.difficulty, 0) / total).toFixed(1)
      : '0';
    const avgWeeks = total > 0
      ? (interviews.reduce((acc, i) => acc + i.process_length_weeks, 0) / total).toFixed(1)
      : '0';
    return { total, offerRate, avgDifficulty, avgWeeks };
  }, [interviews]);

  const toggleInterview = (interviewId: string) => {
    setExpandedInterviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(interviewId)) {
        newSet.delete(interviewId);
      } else {
        newSet.add(interviewId);
      }
      return newSet;
    });
  };

  const getInterviewTypeIcon = (type?: string) => {
    switch (type) {
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'panel':
        return <Users className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return 'text-green-600 bg-green-100';
    if (difficulty <= 3) return 'text-amber-600 bg-amber-100';
    return 'text-red-600 bg-red-100';
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty <= 2) return 'Easy';
    if (difficulty <= 3) return 'Moderate';
    if (difficulty <= 4) return 'Challenging';
    return 'Very Hard';
  };

  const formatMonthYear = (dateString: string) => {
    return format(parseISO(dateString), 'MMM yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" />
              Interview Experiences
            </CardTitle>
            <CardDescription>
              Real interview insights from nurses who applied at {employerName}
            </CardDescription>
          </div>
          <Button className="gap-2">
            Share Your Experience
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Interviews</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.offerRate}%</p>
            <p className="text-xs text-muted-foreground">Offer Rate</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.avgDifficulty}/5</p>
            <p className="text-xs text-muted-foreground">Avg Difficulty</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.avgWeeks}</p>
            <p className="text-xs text-muted-foreground">Avg Weeks</p>
          </div>
        </div>

        {/* Position Filter */}
        {positions.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={filterPosition === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterPosition('all')}
            >
              All Positions
            </Button>
            {positions.map(position => (
              <Button
                key={position}
                variant={filterPosition === position ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterPosition(position)}
              >
                {position}
              </Button>
            ))}
          </div>
        )}

        {/* Interviews List */}
        {filteredInterviews.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="mb-2">No interview experiences shared yet.</p>
            <p className="text-sm">Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map(interview => {
              const isExpanded = expandedInterviews.has(interview.id);

              return (
                <div key={interview.id} className="border rounded-lg overflow-hidden">
                  {/* Interview Header */}
                  <button
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                    onClick={() => toggleInterview(interview.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${interview.offer_received ? 'bg-green-100' : 'bg-slate-100'}`}>
                          {interview.offer_received ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold">{interview.position}</p>
                            <Badge variant={interview.offer_received ? 'default' : 'secondary'} className={interview.offer_received ? 'bg-green-600' : ''}>
                              {interview.offer_received ? 'Offer Received' : 'No Offer'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              {getInterviewTypeIcon(interview.interview_type)}
                              {interview.interview_type ? interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1) : 'In-Person'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {interview.process_length_weeks} week{interview.process_length_weeks !== 1 ? 's' : ''}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatMonthYear(interview.submitted_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${getDifficultyColor(interview.difficulty)}`}>
                          {getDifficultyLabel(interview.difficulty)}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Interview Details */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50 p-4">
                      {/* Interviewer Info */}
                      {interview.interviewer_role && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-1">Interviewed by:</p>
                          <p className="text-sm text-muted-foreground">{interview.interviewer_role}</p>
                        </div>
                      )}

                      {/* Notes */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-1">Experience:</p>
                        <p className="text-sm text-slate-600 bg-white p-3 rounded-lg border">{interview.notes}</p>
                      </div>

                      {/* Interview Questions */}
                      {interview.questions.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-1">
                            <HelpCircle className="w-4 h-4" /> Questions Asked:
                          </p>
                          <ul className="space-y-2">
                            {interview.questions.map((q, idx) => (
                              <li key={idx} className="text-sm text-slate-600 bg-white p-3 rounded-lg border flex items-start gap-2">
                                <span className="text-teal-600 font-medium">{idx + 1}.</span>
                                {q}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Tips */}
                      {interview.tips && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-1">
                            <Lightbulb className="w-4 h-4" /> Tips for Future Candidates:
                          </p>
                          <p className="text-sm text-amber-700">{interview.tips}</p>
                        </div>
                      )}

                      {/* Would Interview Again */}
                      {interview.would_interview_again !== undefined && (
                        <div className="mt-4 pt-4 border-t flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Would interview here again:</span>
                          {interview.would_interview_again ? (
                            <Badge className="bg-green-100 text-green-700 gap-1">
                              <ThumbsUp className="w-3 h-3" /> Yes
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-700 gap-1">
                              <ThumbsDown className="w-3 h-3" /> No
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
