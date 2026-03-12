import Link from 'next/link';
import { MapPin, Building2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RatingStars } from '@/components/reviews/RatingStars';
import { Employer } from '@/lib/types';

interface EmployerCardProps {
    employer: Employer;
}

export function EmployerCard({ employer }: EmployerCardProps) {
    return (
        <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg line-clamp-1">{employer.name}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {employer.city}, {employer.state}
                        </div>
                    </div>
                    {employer.rating_overall && (
                        <div className="flex flex-col items-end">
                            <div className="bg-primary/10 text-primary font-bold px-2 py-1 rounded text-sm">
                                {employer.rating_overall.toFixed(1)}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                                {employer.review_count} reviews
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-2">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className="capitalize">{employer.type.replace('_', ' ')}</Badge>
                    {employer.teaching_status && (
                        <Badge variant="outline" className="capitalize">{employer.teaching_status}</Badge>
                    )}
                </div>
                <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-3 w-3" />
                        <span>{employer.health_system || 'Independent'}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Link href={`/employers/${employer.id}`} className="w-full">
                    <Button variant="outline" className="w-full group">
                        View Details
                        <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    );
}
