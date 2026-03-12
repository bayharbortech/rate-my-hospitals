'use client'

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { reviewSchema, ReviewFormData } from '@/lib/schemas';

interface SubmitReviewFormProps {
    employers: Employer[];
    userId: string;
}

export function SubmitReviewForm({ employers: initialEmployers, userId }: SubmitReviewFormProps) {
    const router = useRouter();
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

    const { register, handleSubmit, formState: { errors }, setValue, watch } = methods;

    const employerId = watch('employerId');
    const filteredEmployers = selectedState
        ? employers.filter(e => e.state === selectedState)
        : employers;

    const handleStateChange = (value: string) => {
        const newState = value === 'all' ? '' : value;
        setSelectedState(newState);
        if (newState && employerId) {
            const currentEmployer = employers.find(e => e.id === employerId);
            if (currentEmployer && currentEmployer.state !== newState) {
                setValue('employerId', '');
            }
        }
    };

    const handleNewEmployer = (newEmployer: Employer) => {
        setEmployers(prev => [...prev, newEmployer].sort((a, b) => a.name.localeCompare(b.name)));
        setSelectedState(newEmployer.state);
        setValue('employerId', newEmployer.id);
    };

    const onSubmit = async (data: ReviewFormData) => {
        setLoading(true);
        setServerError(null);

        const { ratings } = data;
        const overallRating = Math.round(
            Object.values(ratings).reduce((a, b) => a + b, 0) / Object.values(ratings).length
        );

        const submitPayload: Record<string, unknown> = {
            employer_id: data.employerId,
            rating_overall: overallRating,
            rating_staffing: ratings.staffing,
            rating_safety: ratings.safety,
            rating_culture: ratings.culture,
            rating_management: ratings.management,
            rating_pay_benefits: ratings.pay,
            title: data.title,
            review_text: data.reviewText,
            department: data.department,
            position_type: data.positionType,
        };

        if (data.patientLoad) {
            submitPayload.patient_load = data.patientLoad;
        }
        if (data.cattiness && data.cattiness > 0) {
            submitPayload.rating_cattiness = data.cattiness;
        }
        if (data.showSalary) {
            submitPayload.salary = {
                years_experience: parseInt(data.yearsExperience || '0') || 0,
                hourly_rate: parseFloat(data.hourlyRate || '0') || 0,
            };
        }
        if (data.showInterview) {
            submitPayload.interview = {
                difficulty: data.difficulty,
                offer_received: data.offerReceived,
                notes: data.interviewNotes,
                questions: (data.interviewQuestions || '').split('\n').filter(q => q.trim().length > 0),
            };
        }

        try {
            const res = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitPayload),
            });

            if (!res.ok) {
                const responseData = await res.json();
                throw new Error(responseData.error || 'Failed to submit review');
            }
        } catch (err) {
            setServerError(err instanceof Error ? err.message : 'Failed to submit review');
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
        <FormProvider {...methods}>
            <Card>
                <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                    <CardDescription>
                        Please be honest and constructive. Your identity will remain anonymous.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                                                                setValue('employerId', e.id);
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
                            {errors.employerId && (
                                <p className="text-sm text-red-600">{errors.employerId.message}</p>
                            )}
                        </div>

                        {/* Ratings (reads/writes form context directly) */}
                        <RatingsSection />

                        {/* Review Details */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Review Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g., Great culture but low pay"
                                    {...register('title')}
                                />
                                {errors.title && (
                                    <p className="text-sm text-red-600">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="position">Position Type</Label>
                                    <Select onValueChange={val => setValue('positionType', val)} value={watch('positionType') || ''}>
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
                                        {...register('department')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="review">Review</Label>
                                <Textarea
                                    id="review"
                                    placeholder="Share details about staffing ratios, management support, safety protocols, etc."
                                    className="min-h-[150px]"
                                    {...register('reviewText')}
                                />
                                {errors.reviewText && (
                                    <p className="text-sm text-red-600">{errors.reviewText.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Optional: Salary Info (reads/writes form context directly) */}
                        <SalarySection />

                        {/* Optional: Interview Info (reads/writes form context directly) */}
                        <InterviewSection />

                        <ErrorBanner message={serverError} />

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
        </FormProvider>
    );
}
