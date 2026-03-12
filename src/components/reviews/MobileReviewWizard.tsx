'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { reviewSchema, ReviewFormData } from '@/lib/schemas';

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
    const [serverError, setServerError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const [employers, setEmployers] = useState<Employer[]>(initialEmployers);
    const [employerOpen, setEmployerOpen] = useState(false);
    const [selectedState, setSelectedState] = useState('');
    const availableStates = Array.from(new Set(initialEmployers.map(e => e.state))).sort();

    const methods = useForm<ReviewFormData>({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            employerId: '',
            title: '',
            reviewText: '',
            positionType: '',
            department: '',
            patientLoad: '',
            ratings: { staffing: 0, safety: 0, culture: 0, management: 0, pay: 0 },
            cattiness: 0,
            showSalary: false,
            yearsExperience: '',
            hourlyRate: '',
            showInterview: false,
            difficulty: 3,
            offerReceived: false,
            interviewNotes: '',
            interviewQuestions: '',
        },
    });

    const { register, setValue, watch, trigger } = methods;

    const employerId = watch('employerId');
    const ratings = watch('ratings');
    const title = watch('title');
    const reviewText = watch('reviewText');
    const showSalary = watch('showSalary');
    const showInterview = watch('showInterview');
    const hourlyRate = watch('hourlyRate');
    const yearsExperience = watch('yearsExperience');

    const filteredEmployers = selectedState ? employers.filter(e => e.state === selectedState) : employers;
    const selectedEmployer = employers.find(e => e.id === employerId);

    const handleStateChange = (value: string) => {
        const newState = value === 'all' ? '' : value;
        setSelectedState(newState);
        if (newState && employerId) {
            const current = employers.find(e => e.id === employerId);
            if (current && current.state !== newState) setValue('employerId', '');
        }
    };

    const handleNewEmployer = (emp: Employer) => {
        setEmployers(prev => [...prev, emp].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedState(emp.state);
        setValue('employerId', emp.id);
    };

    const canProceed = (): boolean => {
        switch (step) {
            case 1: return !!employerId;
            case 2: return !Object.values(ratings).some(r => r === 0);
            case 3: return (title || '').trim().length > 0 && (reviewText || '').trim().length >= 50;
            case 4: return true;
            case 5: return true;
            default: return true;
        }
    };

    const handleNext = async () => {
        const fieldsToValidate: (keyof ReviewFormData)[] = [];
        if (step === 1) fieldsToValidate.push('employerId');
        if (step === 2) fieldsToValidate.push('ratings');
        if (step === 3) fieldsToValidate.push('title', 'reviewText');

        if (fieldsToValidate.length > 0) {
            const valid = await trigger(fieldsToValidate);
            if (!valid) return;
        }
        setStep(s => s + 1);
    };

    const handleSubmit = async () => {
        const valid = await trigger();
        if (!valid) return;

        setLoading(true);
        setServerError(null);

        const data = methods.getValues();
        const overallRating = Math.round(
            Object.values(data.ratings).reduce((a, b) => a + b, 0) / Object.values(data.ratings).length
        );

        const payload: Record<string, unknown> = {
            employer_id: data.employerId,
            rating_overall: overallRating,
            rating_staffing: data.ratings.staffing,
            rating_safety: data.ratings.safety,
            rating_culture: data.ratings.culture,
            rating_management: data.ratings.management,
            rating_pay_benefits: data.ratings.pay,
            title: data.title,
            review_text: data.reviewText,
            department: data.department,
            position_type: data.positionType,
        };

        if (data.patientLoad) payload.patient_load = data.patientLoad;
        if (data.cattiness && data.cattiness > 0) payload.rating_cattiness = data.cattiness;
        if (data.showSalary) {
            payload.salary = {
                years_experience: parseInt(data.yearsExperience || '0') || 0,
                hourly_rate: parseFloat(data.hourlyRate || '0') || 0,
            };
        }
        if (data.showInterview) {
            payload.interview = {
                difficulty: data.difficulty,
                offer_received: data.offerReceived,
                notes: data.interviewNotes,
                questions: (data.interviewQuestions || '').split('\n').filter(q => q.trim()),
            };
        }

        try {
            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                const responseData = await res.json();
                throw new Error(responseData.error || 'Failed to submit review');
            }
            setSubmitted(true);
            hapticSuccess();
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Failed to submit review');
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
        <FormProvider {...methods}>
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

                <ErrorBanner message={serverError} className="mx-4 mt-4" />

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
                                                                onSelect={() => { setValue('employerId', emp.id); setEmployerOpen(false); }}
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
                                    {methods.formState.errors.employerId && (
                                        <p className="text-sm text-red-600 mt-1">{methods.formState.errors.employerId.message}</p>
                                    )}
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
                            <RatingsSection />
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
                                    <Select value={watch('positionType') || ''} onValueChange={val => setValue('positionType', val)}>
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
                                    <Input placeholder="e.g., ICU, ER, Med-Surg" {...register('department')} />
                                </div>
                                <div>
                                    <Label>Review Title</Label>
                                    <Input placeholder="Summarize your experience" {...register('title')} />
                                    {methods.formState.errors.title && (
                                        <p className="text-sm text-red-600 mt-1">{methods.formState.errors.title.message}</p>
                                    )}
                                </div>
                                <div>
                                    <Label>Your Review (min 50 characters)</Label>
                                    <Textarea
                                        placeholder="What was your experience like? Share details about staffing, management, culture, and more..."
                                        className="min-h-[150px]"
                                        {...register('reviewText')}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">{(reviewText || '').length}/50 characters minimum</p>
                                    {methods.formState.errors.reviewText && (
                                        <p className="text-sm text-red-600 mt-1">{methods.formState.errors.reviewText.message}</p>
                                    )}
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
                                <SalarySection />
                                <InterviewSection />
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
                            onClick={handleNext}
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
        </FormProvider>
    );
}
