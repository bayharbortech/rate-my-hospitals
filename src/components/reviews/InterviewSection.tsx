'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReviewFormData } from '@/lib/schemas';

export function InterviewSection() {
    const { watch, setValue, register } = useFormContext<ReviewFormData>();
    const show = watch('showInterview');
    const difficulty = watch('difficulty') || 3;
    const offerReceived = watch('offerReceived') || false;

    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Interview Experience (Optional)</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('showInterview', !show)}
                >
                    {show ? 'Remove' : 'Add'}
                </Button>
            </div>

            {show && (
                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label>Difficulty (1-5)</Label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((num) => (
                                <Button
                                    key={num}
                                    type="button"
                                    variant={difficulty === num ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setValue('difficulty', num)}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Did you receive an offer?</Label>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={offerReceived ? "default" : "outline"}
                                size="sm"
                                onClick={() => setValue('offerReceived', true)}
                            >
                                Yes
                            </Button>
                            <Button
                                type="button"
                                variant={!offerReceived ? "default" : "outline"}
                                size="sm"
                                onClick={() => setValue('offerReceived', false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Interview Questions</Label>
                        <Textarea
                            placeholder="What questions were you asked? (One per line)"
                            {...register('interviewQuestions')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Any other details about the process..."
                            {...register('interviewNotes')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
