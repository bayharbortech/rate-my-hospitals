'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Employer } from '@/lib/types';
import { POSITION_TYPES } from '@/lib/constants';
import { ErrorBanner } from '@/components/ui/error-banner';
import { AddEmployerDialog } from '@/components/employers/AddEmployerDialog';
import { RatingsSection } from './RatingsSection';
import { SalarySection } from './SalarySection';
import { InterviewSection } from './InterviewSection';

interface SubmitReviewFormProps {
    employers: Employer[];
    userId: string;
}

export function SubmitReviewForm({ employers: initialEmployers, userId }: SubmitReviewFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Employer selection
    const [employers, setEmployers] = useState<Employer[]>(initialEmployers);
    const [employerId, setEmployerId] = useState('');
    const [employerOpen, setEmployerOpen] = useState(false);

    // State picker for filtering employers
    const [selectedState, setSelectedState] = useState('');
    const availableStates = Array.from(new Set(initialEmployers.map(e => e.state))).sort();
    const filteredEmployers = selectedState
        ? employers.filter(e => e.state === selectedState)
        : employers;

    const handleStateChange = (value: string) => {
        const newState = value === 'all' ? '' : value;
        setSelectedState(newState);
        if (newState && employerId) {
            const currentEmployer = employers.find(e => e.id === employerId);
            if (currentEmployer && currentEmployer.state !== newState) {
                setEmployerId('');
            }
        }
    };

    const handleNewEmployer = (newEmployer: Employer) => {
        setEmployers(prev => [...prev, newEmployer].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedState(newEmployer.state);
        setEmployerId(newEmployer.id);
    };

    // Ratings
    const [ratings, setRatings] = useState<Record<string, number>>({
        staffing: 0, safety: 0, culture: 0, management: 0, pay: 0
    });
    const [patientLoad, setPatientLoad] = useState('');
    const [cattiness, setCattiness] = useState(0);

    const handleRatingChange = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    // Review details
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [positionType, setPositionType] = useState('');
    const [department, setDepartment] = useState('');

    // Salary (optional)
    const [showSalary, setShowSalary] = useState(false);
    const [yearsExperience, setYearsExperience] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');

    // Interview (optional)
    const [showInterview, setShowInterview] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [offerReceived, setOfferReceived] = useState(false);
    const [interviewNotes, setInterviewNotes] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!employerId) {
            setError('Please select an employer');
            setLoading(false);
            return;
        }
        if (Object.values(ratings).some(r => r === 0)) {
            setError('Please provide a rating for all categories');
            setLoading(false);
            return;
        }

        const overallRating = Math.round(
            Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
        );

        const submitPayload: Record<string, unknown> = {
            employer_id: employerId,
            rating_overall: overallRating,
            rating_staffing: ratings.staffing,
            rating_safety: ratings.safety,
            rating_culture: ratings.culture,
            rating_management: ratings.management,
            rating_pay_benefits: ratings.pay,
            title,
            review_text: reviewText,
            department,
            position_type: positionType,
        };

        if (patientLoad) {
            submitPayload.patient_load = patientLoad;
        }
        if (cattiness > 0) {
            submitPayload.rating_cattiness = cattiness;
        }
        if (showSalary) {
            submitPayload.salary = {
                years_experience: parseInt(yearsExperience) || 0,
                hourly_rate: parseFloat(hourlyRate) || 0,
            };
        }
        if (showInterview) {
            submitPayload.interview = {
                difficulty,
                offer_received: offerReceived,
                notes: interviewNotes,
                questions: interviewQuestions.split('\n').filter(q => q.trim().length > 0),
            };
        }

        try {
            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitPayload),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
            setLoading(false);
            return;
        }

        setSubmitted(true);
        setLoading(false);
    };

    if (submitted) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        Thank you for sharing your experience. Your review will be visible after it has been approved by our team.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => router.push('/employers')}>
                            Browse Employers
                        </Button>
                        <Button onClick={() => router.push('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Write a Review</CardTitle>
                <CardDescription>
                    Please be honest and constructive. Your identity will remain anonymous.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Employer Selection */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <Label htmlFor="employer">Employer</Label>
                            <AddEmployerDialog onSuccess={handleNewEmployer} />
                        </div>
                        <div className="grid grid-cols-[140px_1fr] gap-2">
                            <Select onValueChange={handleStateChange} value={selectedState || 'all'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All States" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All States</SelectItem>
                                    {availableStates.map(state => (
                                        <SelectItem key={state} value={state}>{state}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Popover open={employerOpen} onOpenChange={setEmployerOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={employerOpen}
                                        className="w-full justify-between font-normal"
                                    >
                                        {employerId
                                            ? employers.find(e => e.id === employerId)?.name
                                            : "Search for a health care facility..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Type to search employers..." />
                                        <CommandList>
                                            <CommandEmpty>No employer found.</CommandEmpty>
                                            <CommandGroup>
                                                {filteredEmployers.map(e => (
                                                    <CommandItem
                                                        key={e.id}
                                                        value={e.name}
                                                        onSelect={() => {
                                                            setEmployerId(e.id);
                                                            setEmployerOpen(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                employerId === e.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {e.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Ratings */}
                    <RatingsSection
                        ratings={ratings}
                        onRatingChange={handleRatingChange}
                        patientLoad={patientLoad}
                        onPatientLoadChange={setPatientLoad}
                        cattiness={cattiness}
                        onCattinessChange={setCattiness}
                    />

                    {/* Review Details */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Review Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Great culture but low pay"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="position">Position Type</Label>
                                <Select onValueChange={setPositionType} value={positionType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {POSITION_TYPES.map(pos => (
                                            <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    placeholder="e.g., ICU, ER, Med-Surg"
                                    value={department}
                                    onChange={e => setDepartment(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="review">Review</Label>
                            <Textarea
                                id="review"
                                placeholder="Share details about staffing ratios, management support, safety protocols, etc."
                                className="min-h-[150px]"
                                required
                                value={reviewText}
                                onChange={e => setReviewText(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Optional: Salary Info */}
                    <SalarySection
                        show={showSalary}
                        onToggle={() => setShowSalary(!showSalary)}
                        hourlyRate={hourlyRate}
                        onHourlyRateChange={setHourlyRate}
                        yearsExperience={yearsExperience}
                        onYearsExperienceChange={setYearsExperience}
                    />

                    {/* Optional: Interview Info */}
                    <InterviewSection
                        show={showInterview}
                        onToggle={() => setShowInterview(!showInterview)}
                        difficulty={difficulty}
                        onDifficultyChange={setDifficulty}
                        offerReceived={offerReceived}
                        onOfferReceivedChange={setOfferReceived}
                        questions={interviewQuestions}
                        onQuestionsChange={setInterviewQuestions}
                        notes={interviewNotes}
                        onNotesChange={setInterviewNotes}
                    />

                    <ErrorBanner message={error} />

                    <div className="pt-4">
                        <Button type="submit" className="w-full" size="lg" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Review'}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-4">
                            By submitting this review, you certify that this review is based on your own experience and is your genuine opinion.
                        </p>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
