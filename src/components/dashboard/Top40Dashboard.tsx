'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Star,
    Shield,
    Users,
    Heart,
    Briefcase,
    DollarSign,
    Cat,
    Loader2,
    Trophy,
    MapPin,
    Stethoscope,
    MessageSquare,
    TrendingUp,
} from 'lucide-react';
import Link from 'next/link';

interface Top40Employer {
    employer_id: string;
    employer_name: string;
    city: string;
    state: string;
    type: string;
    review_count: number;
    avg_overall: number;
    avg_staffing: number;
    avg_safety: number;
    avg_culture: number;
    avg_management: number;
    avg_pay: number;
    avg_cattiness: number | null;
    common_patient_load: string | null;
    has_salary_data: boolean;
    has_interview_data: boolean;
    avg_hourly_rate: number | null;
    positions: string[];
    departments: string[];
}

interface Top40Response {
    employers: Top40Employer[];
    filters: {
        states: string[];
        departments: string[];
        positions: string[];
    };
}

const SORT_OPTIONS = [
    { value: 'avg_overall', label: 'Overall Rating', icon: Star },
    { value: 'avg_staffing', label: 'Staffing', icon: Users },
    { value: 'avg_safety', label: 'Safety', icon: Shield },
    { value: 'avg_culture', label: 'Culture', icon: Heart },
    { value: 'avg_management', label: 'Management', icon: Briefcase },
    { value: 'avg_pay', label: 'Pay & Benefits', icon: DollarSign },
    { value: 'avg_cattiness', label: 'Cattiness (lowest best)', icon: Cat },
    { value: 'review_count', label: 'Most Reviewed', icon: MessageSquare },
];

function RatingBar({ value, max = 5, color = 'bg-teal-500' }: { value: number; max?: number; color?: string }) {
    const pct = (value / max) * 100;
    return (
        <div className="flex items-center gap-2">
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs font-medium w-8">{value.toFixed(1)}</span>
        </div>
    );
}

function getRankBadge(rank: number) {
    if (rank === 1) return <span className="text-2xl font-bold text-amber-500">🏆</span>;
    if (rank === 2) return <span className="text-xl font-bold text-slate-400">🥈</span>;
    if (rank === 3) return <span className="text-xl font-bold text-amber-700">🥉</span>;
    return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
}

export function Top40Dashboard() {
    const [state, setState] = useState('all');
    const [department, setDepartment] = useState('all');
    const [position, setPosition] = useState('all');
    const [sortBy, setSortBy] = useState('avg_overall');

    const { data, isLoading } = useQuery<Top40Response>({
        queryKey: ['top40', state, department, position, sortBy],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (state && state !== 'all') params.set('state', state);
            if (department && department !== 'all') params.set('department', department);
            if (position && position !== 'all') params.set('position', position);
            params.set('sortBy', sortBy);

            const res = await fetch(`/api/top40?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to load rankings');
            return res.json();
        },
    });

    const employers = data?.employers || [];
    const filters = data?.filters || { states: [], departments: [], positions: [] };

    const displayEmployers = sortBy === 'avg_cattiness'
        ? [...employers].sort((a, b) => {
            if (a.avg_cattiness === null) return 1;
            if (b.avg_cattiness === null) return -1;
            return a.avg_cattiness - b.avg_cattiness;
        })
        : employers;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                        <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <CardTitle>Top 40 Places to Work</CardTitle>
                        <CardDescription>Ranked by real nurse reviews — filter to find your best fit</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">State</Label>
                        <Select value={state} onValueChange={setState}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="All states" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All states</SelectItem>
                                {filters.states.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Department</Label>
                        <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="All departments" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All departments</SelectItem>
                                {filters.departments.map(d => (
                                    <SelectItem key={d} value={d}>{d}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Position</Label>
                        <Select value={position} onValueChange={setPosition}>
                            <SelectTrigger className="h-9"><SelectValue placeholder="All positions" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All positions</SelectItem>
                                {filters.positions.map(p => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Sort By</Label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Loading rankings...
                    </div>
                ) : displayEmployers.length === 0 ? (
                    <div className="text-center py-16 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>No reviewed facilities match your filters.</p>
                        <p className="text-sm mt-1">Try broadening your search criteria.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {displayEmployers.map((emp, idx) => (
                            <Link key={emp.employer_id} href={`/employers/${emp.employer_id}`} className="block">
                                <div className="flex items-start gap-3 p-4 rounded-lg border hover:bg-slate-50 transition-colors">
                                    <div className="w-10 flex-shrink-0 flex items-center justify-center pt-1">
                                        {getRankBadge(idx + 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1">
                                            <h3 className="font-semibold text-base truncate">{emp.employer_name}</h3>
                                            <Badge variant="outline" className="text-xs capitalize">{emp.type.replace('_', ' ')}</Badge>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {emp.city}, {emp.state}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageSquare className="w-3 h-3" /> {emp.review_count} review{emp.review_count !== 1 ? 's' : ''}
                                            </span>
                                            {emp.common_patient_load && (
                                                <span className="flex items-center gap-1">
                                                    <Stethoscope className="w-3 h-3" /> Load: {emp.common_patient_load}
                                                </span>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-xs">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500" /> Overall</span>
                                                <RatingBar value={emp.avg_overall} />
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3 text-blue-500" /> Staffing</span>
                                                <RatingBar value={emp.avg_staffing} color="bg-blue-500" />
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3 text-green-500" /> Safety</span>
                                                <RatingBar value={emp.avg_safety} color="bg-green-500" />
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><Heart className="w-3 h-3 text-pink-500" /> Culture</span>
                                                <RatingBar value={emp.avg_culture} color="bg-pink-500" />
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3 text-purple-500" /> Mgmt</span>
                                                <RatingBar value={emp.avg_management} color="bg-purple-500" />
                                            </div>
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" /> Pay</span>
                                                <RatingBar value={emp.avg_pay} color="bg-emerald-500" />
                                            </div>
                                            {emp.avg_cattiness !== null && (
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-muted-foreground flex items-center gap-1"><Cat className="w-3 h-3 text-orange-500" /> Cattiness</span>
                                                    <RatingBar value={emp.avg_cattiness} color="bg-orange-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-lg font-bold">{emp.avg_overall.toFixed(1)}</span>
                                        </div>
                                        {emp.avg_hourly_rate ? (
                                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-xs">
                                                ~${emp.avg_hourly_rate.toFixed(0)}/hr
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                                                No salary data
                                            </Badge>
                                        )}
                                        {emp.has_interview_data ? (
                                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 text-xs">
                                                Interview info
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-xs text-slate-400 border-slate-200">
                                                No interviews
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
