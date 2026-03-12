'use client'

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import { Employer } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { ErrorBanner } from '@/components/ui/error-banner';
import { addEmployerSchema, AddEmployerFormData } from '@/lib/schemas';

interface AddEmployerDialogProps {
    onSuccess: (employer: Employer) => void;
}

export function AddEmployerDialog({ onSuccess }: AddEmployerDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const supabase = createClient();

    const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AddEmployerFormData>({
        resolver: zodResolver(addEmployerSchema),
        defaultValues: {
            name: '',
            type: 'hospital',
            address: '',
            city: '',
            state: 'CA',
            zip_code: '',
        },
    });

    const typeValue = watch('type');

    const onSubmit = async (formData: AddEmployerFormData) => {
        setLoading(true);
        setServerError(null);

        const { data, error: submitError } = await supabase
            .from('employers')
            .insert({
                name: formData.name,
                type: formData.type,
                address: formData.address || '',
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code || '',
                rating_overall: 0,
                review_count: 0,
                badges: []
            })
            .select()
            .single();

        if (submitError) {
            setServerError(submitError.message);
        } else if (data) {
            onSuccess(data as Employer);
            setOpen(false);
            reset();
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Hospital
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Hospital</DialogTitle>
                    <DialogDescription>
                        Can&apos;t find your workplace? Add it here.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <div className="col-span-3">
                                <Input
                                    id="name"
                                    placeholder="e.g. General Hospital"
                                    {...register('name')}
                                />
                                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={typeValue}
                                onValueChange={val => setValue('type', val as AddEmployerFormData['type'])}
                            >
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hospital">Hospital</SelectItem>
                                    <SelectItem value="clinic">Clinic</SelectItem>
                                    <SelectItem value="urgent_care">Urgent Care</SelectItem>
                                    <SelectItem value="nursing_home">Nursing Home</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Address
                            </Label>
                            <Input
                                id="address"
                                placeholder="123 Main St"
                                className="col-span-3"
                                {...register('address')}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">
                                City
                            </Label>
                            <div className="col-span-3">
                                <Input id="city" {...register('city')} />
                                {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">
                                State
                            </Label>
                            <div className="col-span-3">
                                <Input id="state" maxLength={2} {...register('state')} />
                                {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state.message}</p>}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zip" className="text-right">
                                Zip
                            </Label>
                            <Input
                                id="zip"
                                className="col-span-3"
                                {...register('zip_code')}
                            />
                        </div>
                    </div>

                    <ErrorBanner message={serverError} className="mb-4" />

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Adding...' : 'Add Hospital'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
