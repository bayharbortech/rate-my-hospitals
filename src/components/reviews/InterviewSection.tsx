'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InterviewSectionProps {
    show: boolean;
    onToggle: () => void;
    difficulty: number;
    onDifficultyChange: (value: number) => void;
    offerReceived: boolean;
    onOfferReceivedChange: (value: boolean) => void;
    questions: string;
    onQuestionsChange: (value: string) => void;
    notes: string;
    onNotesChange: (value: string) => void;
}

export function InterviewSection({
    show,
    onToggle,
    difficulty,
    onDifficultyChange,
    offerReceived,
    onOfferReceivedChange,
    questions,
    onQuestionsChange,
    notes,
    onNotesChange,
}: InterviewSectionProps) {
    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Interview Experience (Optional)</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onToggle}
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
                                    onClick={() => onDifficultyChange(num)}
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
                                onClick={() => onOfferReceivedChange(true)}
                            >
                                Yes
                            </Button>
                            <Button
                                type="button"
                                variant={!offerReceived ? "default" : "outline"}
                                size="sm"
                                onClick={() => onOfferReceivedChange(false)}
                            >
                                No
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Interview Questions</Label>
                        <Textarea
                            placeholder="What questions were you asked? (One per line)"
                            value={questions}
                            onChange={e => onQuestionsChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                            placeholder="Any other details about the process..."
                            value={notes}
                            onChange={e => onNotesChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
