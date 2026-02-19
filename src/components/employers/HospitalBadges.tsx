import { Badge } from '@/components/ui/badge';
import { Trophy, ShieldCheck, Banknote, GraduationCap, Heart } from 'lucide-react';

interface HospitalBadgesProps {
    badges: string[];
}

export function HospitalBadges({ badges }: HospitalBadgesProps) {
    if (!badges || badges.length === 0) return null;

    const getBadgeIcon = (badge: string) => {
        if (badge.includes('Safety')) return <ShieldCheck className="h-3 w-3 mr-1" />;
        if (badge.includes('Paying')) return <Banknote className="h-3 w-3 mr-1" />;
        if (badge.includes('Teaching')) return <GraduationCap className="h-3 w-3 mr-1" />;
        if (badge.includes('Community')) return <Heart className="h-3 w-3 mr-1" />;
        return <Trophy className="h-3 w-3 mr-1" />;
    };

    const getBadgeColor = (badge: string) => {
        if (badge.includes('Safety')) return 'bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-200';
        if (badge.includes('Paying')) return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200';
        if (badge.includes('Teaching')) return 'bg-purple-100 text-purple-800 hover:bg-purple-200 border-purple-200';
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-200';
    };

    return (
        <div className="flex flex-wrap gap-2 mt-2">
            {badges.map((badge, index) => (
                <Badge
                    key={index}
                    variant="outline"
                    className={`${getBadgeColor(badge)} border`}
                >
                    {getBadgeIcon(badge)}
                    {badge}
                </Badge>
            ))}
        </div>
    );
}
