'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Send,
  HelpCircle,
  User,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getTimeAgo } from '@/lib/constants';
import { ErrorBanner } from '@/components/ui/error-banner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Answer {
  id: string;
  question_id: string;
  user_id: string | null;
  answer_text: string;
  created_at: string;
  upvotes: number;
  is_accepted: boolean;
}

interface Question {
  id: string;
  employer_id: string;
  user_id: string | null;
  question_text: string;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  answers: Answer[];
}

interface QASectionProps {
  employerId: string;
  employerName: string;
}

export function QASection({ employerId, employerName }: QASectionProps) {
  const supabase = createClient();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [filter, setFilter] = useState<'all' | 'answered' | 'unanswered'>('all');
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [answerTexts, setAnswerTexts] = useState<Record<string, string>>({});
  const [submittingAnswer, setSubmittingAnswer] = useState<string | null>(null);
  const [votedQuestions, setVotedQuestions] = useState<Set<string>>(new Set());
  const [votedAnswers, setVotedAnswers] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Fetch questions and answers
  const fetchQuestions = useCallback(async () => {
    setLoading(true);

    // Fetch questions for this employer
    const { data: questionsData, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (questionsError) {
      setErrorMessage(`Failed to load questions: ${questionsError.message}`);
      setLoading(false);
      return;
    }

    // Fetch answers for these questions
    const questionIds = questionsData?.map(q => q.id) || [];
    let answersData: Answer[] = [];

    if (questionIds.length > 0) {
      const { data, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds)
        .order('upvotes', { ascending: false });

      if (answersError) {
        setErrorMessage(`Failed to load answers: ${answersError.message}`);
      } else {
        answersData = data || [];
      }
    }

    // Fetch user's votes if logged in
    if (user) {
      const { data: questionVotes } = await supabase
        .from('question_votes')
        .select('question_id')
        .eq('user_id', user.id);

      const { data: answerVotes } = await supabase
        .from('answer_votes')
        .select('answer_id')
        .eq('user_id', user.id);

      setVotedQuestions(new Set(questionVotes?.map(v => v.question_id) || []));
      setVotedAnswers(new Set(answerVotes?.map(v => v.answer_id) || []));
    }

    // Combine questions with their answers
    const questionsWithAnswers: Question[] = (questionsData || []).map(q => ({
      ...q,
      answers: answersData.filter(a => a.question_id === q.id)
    }));

    setQuestions(questionsWithAnswers);
    setLoading(false);
  }, [supabase, employerId, user]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const filteredQuestions = questions.filter(q => {
    switch (filter) {
      case 'answered':
        return q.is_answered;
      case 'unanswered':
        return !q.is_answered;
      default:
        return true;
    }
  });

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitQuestion = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!newQuestion.trim()) return;

    setSubmitting(true);
    setErrorMessage(null);
    const { error } = await supabase.from('questions').insert({
      employer_id: employerId,
      user_id: user.id,
      question_text: newQuestion.trim()
    });

    if (error) {
      setErrorMessage(`Failed to submit question: ${error.message}`);
    } else {
      setNewQuestion('');
      setShowAskForm(false);
      fetchQuestions();
    }
    setSubmitting(false);
  };

  const handleSubmitAnswer = async (questionId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const answerText = answerTexts[questionId];
    if (!answerText?.trim()) return;

    setSubmittingAnswer(questionId);
    setErrorMessage(null);
    const { error } = await supabase.from('answers').insert({
      question_id: questionId,
      user_id: user.id,
      answer_text: answerText.trim()
    });

    if (error) {
      setErrorMessage(`Failed to submit answer: ${error.message}`);
    } else {
      setAnswerTexts(prev => ({ ...prev, [questionId]: '' }));
      fetchQuestions();
    }
    setSubmittingAnswer(null);
  };

  const handleVoteQuestion = async (questionId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const hasVoted = votedQuestions.has(questionId);

    if (hasVoted) {
      // Remove vote
      await supabase
        .from('question_votes')
        .delete()
        .eq('question_id', questionId)
        .eq('user_id', user.id);

      setVotedQuestions(prev => {
        const newSet = new Set(prev);
        newSet.delete(questionId);
        return newSet;
      });
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes - 1 } : q
      ));
    } else {
      // Add vote
      const { error } = await supabase.from('question_votes').insert({
        question_id: questionId,
        user_id: user.id
      });

      if (!error) {
        setVotedQuestions(prev => new Set(prev).add(questionId));
        setQuestions(prev => prev.map(q =>
          q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
        ));
      }
    }
  };

  const handleVoteAnswer = async (answerId: string, questionId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const hasVoted = votedAnswers.has(answerId);

    if (hasVoted) {
      // Remove vote
      await supabase
        .from('answer_votes')
        .delete()
        .eq('answer_id', answerId)
        .eq('user_id', user.id);

      setVotedAnswers(prev => {
        const newSet = new Set(prev);
        newSet.delete(answerId);
        return newSet;
      });
      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, answers: q.answers.map(a =>
              a.id === answerId ? { ...a, upvotes: a.upvotes - 1 } : a
            )}
          : q
      ));
    } else {
      // Add vote
      const { error } = await supabase.from('answer_votes').insert({
        answer_id: answerId,
        user_id: user.id
      });

      if (!error) {
        setVotedAnswers(prev => new Set(prev).add(answerId));
        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, answers: q.answers.map(a =>
                a.id === answerId ? { ...a, upvotes: a.upvotes + 1 } : a
              )}
            : q
        ));
      }
    }
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            <span className="ml-2">Loading questions...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-teal-600" />
              Questions & Answers
            </CardTitle>
            <CardDescription>
              Get insider info about working at {employerName}
            </CardDescription>
          </div>
          {user ? (
            <Button onClick={() => setShowAskForm(!showAskForm)} className="gap-2">
              <HelpCircle className="w-4 h-4" />
              Ask a Question
            </Button>
          ) : (
            <Link href="/login?view=login">
              <Button variant="outline" className="gap-2">
                <HelpCircle className="w-4 h-4" />
                Log in to Ask
              </Button>
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ErrorBanner message={errorMessage} className="mb-4" />

        {/* Ask Question Form */}
        {showAskForm && (
          <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
            <h4 className="font-medium mb-2">Ask about {employerName}</h4>
            <Textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="What would you like to know? (e.g., What is the nurse-to-patient ratio? How is the scheduling?)"
              className="mb-3 min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowAskForm(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || submitting}
                className="gap-2"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit Question
              </Button>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All ({questions.length})
          </Button>
          <Button
            variant={filter === 'answered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('answered')}
          >
            Answered ({questions.filter(q => q.is_answered).length})
          </Button>
          <Button
            variant={filter === 'unanswered' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('unanswered')}
          >
            Unanswered ({questions.filter(q => !q.is_answered).length})
          </Button>
        </div>

        {/* Questions List */}
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="mb-2">No questions yet.</p>
            <p className="text-sm">Be the first to ask about {employerName}!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map(question => {
              const isExpanded = expandedQuestions.has(question.id);
              const hasAnswers = question.answers.length > 0;
              const hasVotedQuestion = votedQuestions.has(question.id);

              return (
                <div key={question.id} className="border rounded-lg overflow-hidden">
                  {/* Question Header */}
                  <button
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${question.is_answered ? 'bg-green-100' : 'bg-slate-100'}`}>
                        {question.is_answered ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <HelpCircle className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900">{question.question_text}</p>
                        <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <button
                            className={`flex items-center gap-1 hover:text-teal-600 transition-colors ${hasVotedQuestion ? 'text-teal-600 font-medium' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVoteQuestion(question.id);
                            }}
                          >
                            <ThumbsUp className={`w-4 h-4 ${hasVotedQuestion ? 'fill-current' : ''}`} /> {question.upvotes}
                          </button>
                          <span>{question.answers.length} answer{question.answers.length !== 1 ? 's' : ''}</span>
                          <span>{getTimeAgo(question.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Answers Section */}
                  {isExpanded && (
                    <div className="border-t bg-slate-50">
                      {hasAnswers ? (
                        <div className="divide-y">
                          {question.answers.map(answer => {
                            const hasVotedAnswer = votedAnswers.has(answer.id);
                            return (
                              <div key={answer.id} className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-white rounded-full border">
                                    <User className="w-4 h-4 text-slate-400" />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      {answer.is_accepted && (
                                        <Badge className="bg-green-600 text-xs">
                                          <CheckCircle className="w-3 h-3 mr-1" /> Accepted
                                        </Badge>
                                      )}
                                      <span className="text-xs text-muted-foreground">
                                        {formatDate(answer.created_at, 'short')}
                                      </span>
                                    </div>
                                    <p className="text-sm text-slate-700">{answer.answer_text}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`h-7 text-xs gap-1 ${hasVotedAnswer ? 'text-teal-600' : ''}`}
                                        onClick={() => handleVoteAnswer(answer.id, question.id)}
                                      >
                                        <ThumbsUp className={`w-3 h-3 ${hasVotedAnswer ? 'fill-current' : ''}`} />
                                        Helpful ({answer.upvotes})
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          <p className="text-sm mb-2">No answers yet.</p>
                        </div>
                      )}

                      {/* Answer Form */}
                      {user ? (
                        <div className="p-4 border-t bg-white">
                          <Textarea
                            value={answerTexts[question.id] || ''}
                            onChange={(e) => setAnswerTexts(prev => ({
                              ...prev,
                              [question.id]: e.target.value
                            }))}
                            placeholder="Share your knowledge about this..."
                            className="mb-2 min-h-[80px]"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              className="gap-1"
                              onClick={() => handleSubmitAnswer(question.id)}
                              disabled={!answerTexts[question.id]?.trim() || submittingAnswer === question.id}
                            >
                              {submittingAnswer === question.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Send className="w-3 h-3" />
                              )}
                              Post Answer
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border-t bg-white text-center">
                          <Link href="/login?view=login">
                            <Button variant="outline" size="sm">
                              Log in to answer
                            </Button>
                          </Link>
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
