'use client';

import { Star, Cat } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/useIsMobile';
import { hapticLight } from '@/lib/haptics';

interface RatingsSectionProps {
    ratings: Record<string, number>;
    onRatingChange: (category: string, value: number) => void;
    patientLoad: string;
    onPatientLoadChange: (value: string) => void;
    cattiness: number;
    onCattinessChange: (value: number) => void;
}

export function RatingsSection({
    ratings,
    onRatingChange,
    patientLoad,
    onPatientLoadChange,
    cattiness,
    onCattinessChange,
}: RatingsSectionProps) {
    const isMobile = useIsMobile();
    const starSize = isMobile ? 'h-8 w-8' : 'h-6 w-6';
    const starPadding = isMobile ? 'p-1.5' : 'p-1';

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ratings</h3>
            <div className="grid gap-4">
                {Object.keys(ratings).map((category) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="capitalize font-medium">{category.replace('_', ' ')}</span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => { hapticLight(); onRatingChange(category, star); }}
                                    className={`${starPadding} transition-colors ${star <= ratings[category]
                                        ? 'text-yellow-500'
                                        : 'text-slate-300 hover:text-yellow-200'
                                        }`}
                                >
                                    <Star className={`${starSize} fill-current`} />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Patient Load */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Patient Load</span>
                <Select onValueChange={onPatientLoadChange} value={patientLoad}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1-4">1-4</SelectItem>
                        <SelectItem value="5-8">5-8</SelectItem>
                        <SelectItem value="9-12">9-12</SelectItem>
                        <SelectItem value="13-16">13-16</SelectItem>
                        <SelectItem value="17-20">17-20</SelectItem>
                        <SelectItem value="20+">20+</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Cattiness */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Cattiness</span>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <button
                            key={level}
                            type="button"
                            onClick={() => { hapticLight(); onCattinessChange(level); }}
                            className={`${starPadding} transition-colors ${level <= cattiness
                                ? 'text-orange-500'
                                : 'text-slate-300 hover:text-orange-200'
                                }`}
                        >
                            <Cat className={`${starSize} fill-current`} />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
