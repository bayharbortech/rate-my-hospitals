'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ReviewFormData } from '@/lib/schemas';

export function SalarySection() {
    const { watch, setValue, register } = useFormContext<ReviewFormData>();
    const show = watch('showSalary');

    return (
        <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold">Salary Information (Optional)</h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setValue('showSalary', !show)}
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
                            {...register('hourlyRate')}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            {...register('yearsExperience')}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
