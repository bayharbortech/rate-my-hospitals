import { Badge } from '@/components/ui/badge';
import { Check, X, RotateCcw, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';

export function RiskBadge({ level }: { level: string }) {
    switch (level) {
        case 'low':
            return <Badge className="bg-green-100 text-green-700 hover:bg-green-200"><ShieldCheck className="w-3 h-3 mr-1" />Low Risk</Badge>;
        case 'medium':
            return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Medium Risk</Badge>;
        case 'high':
            return <Badge className="bg-red-100 text-red-700 hover:bg-red-200"><ShieldAlert className="w-3 h-3 mr-1" />High Risk</Badge>;
        default:
            return null;
    }
}

export function RecommendationBadge({ recommendation }: { recommendation: string }) {
    switch (recommendation) {
        case 'approve':
            return <Badge className="bg-green-50 text-green-600 border border-green-300 hover:bg-green-100"><Check className="w-3 h-3 mr-1" />AI: Approve</Badge>;
        case 'revise':
            return <Badge className="bg-orange-50 text-orange-600 border border-orange-300 hover:bg-orange-100"><RotateCcw className="w-3 h-3 mr-1" />AI: Revise</Badge>;
        case 'reject':
            return <Badge className="bg-red-50 text-red-600 border border-red-300 hover:bg-red-100"><X className="w-3 h-3 mr-1" />AI: Reject</Badge>;
        default:
            return null;
    }
}
