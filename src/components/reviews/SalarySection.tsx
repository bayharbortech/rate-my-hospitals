'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SalarySectionProps {
    show: boolean;
    onToggle: () => void;
    hourlyRate: string;
    onHourlyRateChange: (value: string) => void;
    yearsExperience: string;
    onYearsExperienceChange: (value: string) => void;
}

export function SalarySection({
    show,
    onToggle,
    hourlyRate,
    onHourlyRateChange,
    yearsExperience,
    onYearsExperienceChange,
}: SalarySectionProps) {
    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Salary Information (Optional)</h3>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                        <Label>Hourly Rate ($)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={hourlyRate}
                            onChange={e => onHourlyRateChange(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={yearsExperience}
                            onChange={e => onYearsExperienceChange(e.target.value)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
