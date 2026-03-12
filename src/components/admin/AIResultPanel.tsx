import { AIReviewResult } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

export function AIResultPanel({ result }: { result: AIReviewResult }) {
    return (
        <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">AI Compliance Review</span>
                <RiskBadge level={result.risk_level} />
                <Badge variant="outline">
                    Recommends: {result.recommendation}
                </Badge>
            </div>

            <p className="text-sm text-blue-800">{result.summary}</p>

            {result.issues.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-blue-900">Flagged Issues:</p>
                    {result.issues.map((issue, i) => (
                        <div key={i} className="p-3 bg-white rounded border text-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs capitalize">{issue.type}</Badge>
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${issue.severity === 'high' ? 'text-red-600 border-red-300' :
                                        issue.severity === 'medium' ? 'text-yellow-600 border-yellow-300' :
                                            'text-green-600 border-green-300'
                                        }`}
                                >
                                    {issue.severity}
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-xs italic mb-1">&quot;{issue.excerpt}&quot;</p>
                            <p className="text-slate-700">{issue.explanation}</p>
                        </div>
                    ))}
                </div>
            )}

            {(result.revised_text || result.revised_title) && result.issues.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-semibold text-blue-900">AI-Revised Version:</p>
                    <div className="p-3 bg-white rounded border text-sm">
                        <p className="font-medium mb-1">{result.revised_title}</p>
                        <p className="text-slate-700 whitespace-pre-wrap">{result.revised_text}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
