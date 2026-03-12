'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle } from 'lucide-react';
import { contactSchema, ContactFormData } from '@/lib/schemas';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    });

    const onSubmit = async (data: ContactFormData) => {
        // TODO: Wire to backend API or email service
        console.log('Contact form submitted:', data);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="container py-12 max-w-xl mx-auto text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
                <p className="text-muted-foreground">
                    Thank you for reaching out. We&apos;ll get back to you as soon as possible.
                </p>
            </div>
        );
    }

    return (
        <div className="container py-12 max-w-xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Contact Support</h1>
            <p className="text-muted-foreground mb-8">
                Have a question, suggestion, or need help? Fill out the form below and we&apos;ll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" placeholder="Your name" {...register('name')} />
                    {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" {...register('email')} />
                    {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" {...register('subject')} />
                    {errors.subject && <p className="text-sm text-red-600">{errors.subject.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Tell us more..." className="min-h-[150px]" {...register('message')} />
                    {errors.message && <p className="text-sm text-red-600">{errors.message.message}</p>}
                </div>

                <Button className="w-full" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
            </form>
        </div>
    );
}
