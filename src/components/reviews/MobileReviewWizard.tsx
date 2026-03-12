'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { hapticSuccess } from '@/lib/haptics';
import { useRouter } from 'next/navigation';
import { Employer } from '@/lib/types';
import { POSITION_TYPES } from '@/lib/constants';
import { ErrorBanner } from '@/components/ui/error-banner';
import { AddEmployerDialog } from '@/components/employers/AddEmployerDialog';
import { RatingsSection } from './RatingsSection';
import { SalarySection } from './SalarySection';
import { InterviewSection } from './InterviewSection';

interface MobileReviewWizardProps {
    employers: Employer[];
    userId: string;
}

const STEPS = [
    { id: 1, label: 'Hospital' },
    { id: 2, label: 'Ratings' },
    { id: 3, label: 'Review' },
    { id: 4, label: 'Extras' },
    { id: 5, label: 'Submit' },
];

export default function MobileReviewWizard({ employers: initialEmployers, userId }: MobileReviewWizardProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    // Employer
    const [employers, setEmployers] = useState<Employer[]>(initialEmployers);
    const [employerId, setEmployerId] = useState('');
    const [employerOpen, setEmployerOpen] = useState(false);
    const [selectedState, setSelectedState] = useState('');
    const availableStates = Array.from(new Set(initialEmployers.map(e => e.state))).sort();
    const filteredEmployers = selectedState ? employers.filter(e => e.state === selectedState) : employers;

    const handleStateChange = (value: string) => {
        const newState = value === 'all' ? '' : value;
        setSelectedState(newState);
        if (newState && employerId) {
            const current = employers.find(e => e.id === employerId);
            if (current && current.state !== newState) setEmployerId('');
        }
    };
    const handleNewEmployer = (emp: Employer) => {
        setEmployers(prev => [...prev, emp].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedState(emp.state);
        setEmployerId(emp.id);
    };

    // Ratings
    const [ratings, setRatings] = useState<Record<string, number>>({
        staffing: 0, safety: 0, culture: 0, management: 0, pay: 0,
    });
    const [patientLoad, setPatientLoad] = useState('');
    const [cattiness, setCattiness] = useState(0);
    const handleRatingChange = (category: string, value: number) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    // Review
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [positionType, setPositionType] = useState('');
    const [department, setDepartment] = useState('');

    // Optional
    const [showSalary, setShowSalary] = useState(false);
    const [yearsExperience, setYearsExperience] = useState('');
    const [hourlyRate, setHourlyRate] = useState('');
    const [showInterview, setShowInterview] = useState(false);
    const [difficulty, setDifficulty] = useState(3);
    const [offerReceived, setOfferReceived] = useState(false);
    const [interviewNotes, setInterviewNotes] = useState('');
    const [interviewQuestions, setInterviewQuestions] = useState('');

    const selectedEmployer = employers.find(e => e.id === employerId);

    const canProceed = (): boolean => {
        switch (step) {
            case 1: return !!employerId;
            case 2: return !Object.values(ratings).some(r => r === 0);
            case 3: return title.trim().length > 0 && reviewText.trim().length >= 50;
            case 4: return true;
            case 5: return true;
            default: return true;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const overallRating = Math.round(
            Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
        );

        const payload: Record<string, unknown> = {
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

        if (patientLoad) payload.patient_load = patientLoad;
        if (cattiness > 0) payload.rating_cattiness = cattiness;
        if (showSalary) {
            payload.salary = {
                years_experience: parseInt(yearsExperience) || 0,
                hourly_rate: parseFloat(hourlyRate) || 0,
            };
        }
        if (showInterview) {
            payload.interview = {
                difficulty,
                offer_received: offerReceived,
                notes: interviewNotes,
                questions: interviewQuestions.split('\n').filter(q => q.trim()),
            };
        }

        try {
            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit review');
            }
            setSubmitted(true);
            hapticSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Review Submitted!</h2>
                <p className="text-muted-foreground mb-6">
                    Your review has been submitted for moderation. Thank you for helping fellow nurses!
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
                    <Button variant="outline" onClick={() => router.push('/employers')}>Browse Hospitals</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Progress bar */}
            <div className="bg-white border-b px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Step {step} of {STEPS.length}</span>
                    <span className="text-xs text-muted-foreground">{STEPS[step - 1].label}</span>
                </div>
                <div className="flex gap-1">
                    {STEPS.map(s => (
                        <div
                            key={s.id}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                                s.id <= step ? 'bg-teal-500' : 'bg-slate-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <ErrorBanner message={error} className="mx-4 mt-4" />

            {/* Step content */}
            <div className="flex-1 px-4 py-6">
                {/* Step 1: Hospital Selection */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Select a Hospital</h2>
                        <p className="text-sm text-muted-foreground">Choose the facility you want to review.</p>

                        <div className="space-y-3">
                            <div>
                                <Label>Filter by State</Label>
                                <Select value={selectedState || 'all'} onValueChange={handleStateChange}>
                                    <SelectTrigger><SelectValue placeholder="All States" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All States</SelectItem>
                                        {availableStates.map(state => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Hospital</Label>
                                <Popover open={employerOpen} onOpenChange={setEmployerOpen}>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" role="combobox" className="w-full justify-between">
                                            {selectedEmployer?.name || 'Select hospital...'}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[calc(100vw-2rem)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search hospitals..." />
                                            <CommandList>
                                                <CommandEmpty>No hospital found.</CommandEmpty>
                                                <CommandGroup>
                                                    {filteredEmployers.map(emp => (
                                                        <CommandItem
                                                            key={emp.id}
                                                            value={emp.name}
                                                            onSelect={() => { setEmployerId(emp.id); setEmployerOpen(false); }}
                                                        >
                                                            <Check className={cn('mr-2 h-4 w-4', employerId === emp.id ? 'opacity-100' : 'opacity-0')} />
                                                            <div>
                                                                <div className="font-medium">{emp.name}</div>
                                                                <div className="text-xs text-muted-foreground">{emp.city}, {emp.state}</div>
                                                            </div>
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <AddEmployerDialog onSuccess={handleNewEmployer} />
                        </div>
                    </div>
                )}

                {/* Step 2: Ratings */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Rate Your Experience</h2>
                        <p className="text-sm text-muted-foreground">Tap the stars to rate each category.</p>
                        <RatingsSection
                            ratings={ratings}
                            onRatingChange={handleRatingChange}
                            patientLoad={patientLoad}
                            onPatientLoadChange={setPatientLoad}
                            cattiness={cattiness}
                            onCattinessChange={setCattiness}
                        />
                    </div>
                )}

                {/* Step 3: Written Review */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Write Your Review</h2>
                        <p className="text-sm text-muted-foreground">Share details about your experience.</p>

                        <div className="space-y-3">
                            <div>
                                <Label>Position Type</Label>
                                <Select value={positionType} onValueChange={setPositionType}>
                                    <SelectTrigger><SelectValue placeholder="Select position..." /></SelectTrigger>
                                    <SelectContent>
                                        {POSITION_TYPES.map(pt => (
                                            <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Department</Label>
                                <Input value={department} onChange={e => setDepartment(e.target.value)} placeholder="e.g., ICU, ER, Med-Surg" />
                            </div>
                            <div>
                                <Label>Review Title</Label>
                                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Summarize your experience" />
                            </div>
                            <div>
                                <Label>Your Review (min 50 characters)</Label>
                                <Textarea
                                    value={reviewText}
                                    onChange={e => setReviewText(e.target.value)}
                                    placeholder="What was your experience like? Share details about staffing, management, culture, and more..."
                                    className="min-h-[150px]"
                                />
                                <p className="text-xs text-muted-foreground mt-1">{reviewText.length}/50 characters minimum</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Optional Extras */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Optional Information</h2>
                        <p className="text-sm text-muted-foreground">Help fellow nurses with salary and interview data.</p>

                        <div className="space-y-4">
                            <SalarySection
                                show={showSalary}
                                onToggle={() => setShowSalary(!showSalary)}
                                yearsExperience={yearsExperience}
                                onYearsExperienceChange={setYearsExperience}
                                hourlyRate={hourlyRate}
                                onHourlyRateChange={setHourlyRate}
                            />

                            <InterviewSection
                                show={showInterview}
                                onToggle={() => setShowInterview(!showInterview)}
                                difficulty={difficulty}
                                onDifficultyChange={setDifficulty}
                                offerReceived={offerReceived}
                                onOfferReceivedChange={setOfferReceived}
                                notes={interviewNotes}
                                onNotesChange={setInterviewNotes}
                                questions={interviewQuestions}
                                onQuestionsChange={setInterviewQuestions}
                            />
                        </div>
                    </div>
                )}

                {/* Step 5: Review & Submit */}
                {step === 5 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Review & Submit</h2>
                        <p className="text-sm text-muted-foreground">Confirm your review details before submitting.</p>

                        <div className="space-y-3">
                            <div className="bg-white p-4 rounded-lg border">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Hospital</h3>
                                <p className="font-semibold">{selectedEmployer?.name || 'Not selected'}</p>
                            </div>

                            <div className="bg-white p-4 rounded-lg border">
                                <h3 className="text-sm font-medium text-muted-foreground mb-2">Ratings</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    {Object.entries(ratings).map(([key, val]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="capitalize">{key}</span>
                                            <span className="font-medium">{val}/5</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border">
                                <h3 className="text-sm font-medium text-muted-foreground mb-1">Review</h3>
                                <p className="font-semibold">{title || 'No title'}</p>
                                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{reviewText || 'No review text'}</p>
                            </div>

                            {(showSalary || showInterview) && (
                                <div className="bg-white p-4 rounded-lg border">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Extras</h3>
                                    {showSalary && <p className="text-sm">Salary: ${hourlyRate}/hr, {yearsExperience} yrs exp</p>}
                                    {showInterview && <p className="text-sm">Interview experience included</p>}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation buttons */}
            <div className="sticky bottom-14 bg-white border-t px-4 py-3 flex gap-3"
                style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
            >
                {step > 1 && (
                    <Button variant="outline" className="flex-1 gap-1" onClick={() => setStep(s => s - 1)}>
                        <ChevronLeft className="w-4 h-4" /> Back
                    </Button>
                )}
                {step < 5 ? (
                    <Button
                        className="flex-1 gap-1"
                        onClick={() => setStep(s => s + 1)}
                        disabled={!canProceed()}
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </Button>
                ) : (
                    <Button
                        className="flex-1 bg-green-600 hover:bg-green-700 gap-1"
                        onClick={handleSubmit}
                        disabled={loading || !canProceed()}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        Submit Review
                    </Button>
                )}
            </div>
        </div>
    );
}
