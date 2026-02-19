'use client'

import { useState } from 'react';
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

interface AddEmployerDialogProps {
    onSuccess: (employer: Employer) => void;
}

export function AddEmployerDialog({ onSuccess }: AddEmployerDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const [formData, setFormData] = useState({
        name: '',
        type: 'hospital',
        address: '',
        city: '',
        state: 'CA', // Default to CA as per mock data context
        zip_code: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Basic validation
        if (!formData.name || !formData.city || !formData.state) {
            setError('Please fill in all required fields.');
            setLoading(false);
            return;
        }

        const { data, error: submitError } = await supabase
            .from('employers')
            .insert({
                name: formData.name,
                type: formData.type,
                address: formData.address,
                city: formData.city,
                state: formData.state,
                zip_code: formData.zip_code,
                // Defaults
                rating_overall: 0,
                review_count: 0,
                badges: []
            })
            .select()
            .single();

        if (submitError) {
            setError(submitError.message);
        } else if (data) {
            onSuccess(data as Employer);
            setOpen(false);
            // Reset form
            setFormData({
                name: '',
                type: 'hospital',
                address: '',
                city: '',
                state: 'CA',
                zip_code: ''
            });
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
                        Can't find your workplace? Add it here.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => handleChange('name', e.target.value)}
                                className="col-span-3"
                                placeholder="e.g. General Hospital"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">
                                Type
                            </Label>
                            <Select
                                value={formData.type}
                                onValueChange={val => handleChange('type', val)}
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
                                value={formData.address}
                                onChange={e => handleChange('address', e.target.value)}
                                className="col-span-3"
                                placeholder="123 Main St"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">
                                City
                            </Label>
                            <Input
                                id="city"
                                value={formData.city}
                                onChange={e => handleChange('city', e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">
                                State
                            </Label>
                            <Input
                                id="state"
                                value={formData.state}
                                onChange={e => handleChange('state', e.target.value)}
                                className="col-span-3"
                                maxLength={2}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="zip" className="text-right">
                                Zip
                            </Label>
                            <Input
                                id="zip"
                                value={formData.zip_code}
                                onChange={e => handleChange('zip_code', e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                    </div>

                    <ErrorBanner message={error} className="mb-4" />

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
