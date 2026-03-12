import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

export function EmployerCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-32 w-full rounded-none" />
            <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-1" />
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                </div>
            </CardContent>
        </Card>
    );
}

export function ReviewCardSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex justify-between">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-2/3" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="grid grid-cols-2 gap-2 mt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function BlogCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <Skeleton className="h-48 w-full rounded-none" />
            <CardHeader>
                <div className="flex gap-2 mb-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4 mt-1" />
                <div className="flex gap-4 mt-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-16" />
                </div>
            </CardHeader>
            <CardContent>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full mt-1" />
                <Skeleton className="h-4 w-2/3 mt-1" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-4 w-24" />
            </CardFooter>
        </Card>
    );
}

export function BlogCardHorizontalSkeleton() {
    return (
        <div className="flex gap-3 p-3 bg-card rounded-lg border">
            <Skeleton className="h-20 w-20 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-24" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-card rounded-lg border px-3 py-2 min-w-[70px] text-center">
            <Skeleton className="h-6 w-8 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto mt-1" />
        </div>
    );
}

export function QuestionSkeleton() {
    return (
        <div className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
}
