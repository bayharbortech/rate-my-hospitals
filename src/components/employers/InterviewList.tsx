import { Interview } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface InterviewListProps {
    interviews: Interview[];
}

export function InterviewList({ interviews }: InterviewListProps) {
    if (interviews.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No interview insights yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {interviews.map((interview) => (
                <Card key={interview.id}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-base font-bold">{interview.position}</CardTitle>
                                <div className="text-sm text-muted-foreground mt-1">
                                    Process: {interview.process_length_weeks} weeks • Difficulty: {interview.difficulty}/5
                                </div>
                            </div>
                            {interview.offer_received ? (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle2 className="h-3 w-3 mr-1" /> Offer Received
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="bg-slate-50 text-slate-600">
                                    <XCircle className="h-3 w-3 mr-1" /> No Offer
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <h4 className="text-sm font-semibold mb-1 flex items-center">
                                    <HelpCircle className="h-3 w-3 mr-1 text-primary" /> Interview Questions
                                </h4>
                                <ul className="list-disc list-inside text-sm text-muted-foreground pl-1">
                                    {interview.questions.map((q, i) => (
                                        <li key={i}>{q}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-md text-sm">
                                <span className="font-semibold">Notes: </span>
                                {interview.notes}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
