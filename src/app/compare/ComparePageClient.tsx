'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employer, Review, Salary } from '@/lib/types';
import {
  Star,
  Users,
  Shield,
  Heart,
  Briefcase,
  DollarSign,
  Building2,
  Award,
  X,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface ComparePageClientProps {
  employers: Employer[];
  reviews: Review[];
  salaries: Salary[];
}

function RatingBar({ value, max = 5, color = 'teal' }: { value: number; max?: number; color?: string }) {
  const percentage = (value / max) * 100;
  const colorClasses: Record<string, string> = {
    teal: 'bg-teal-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    violet: 'bg-violet-500',
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-semibold w-8">{value.toFixed(1)}</span>
    </div>
  );
}

function ComparisonColumn({
  employer,
  reviews,
  salaries,
  onRemove
}: {
  employer: Employer;
  reviews: Review[];
  salaries: Salary[];
  onRemove: () => void;
}) {
  const employerReviews = reviews.filter(r => r.employer_id === employer.id);
  const employerSalaries = salaries.filter(s => s.employer_id === employer.id);

  const avgRatings = {
    staffing: employerReviews.length ? employerReviews.reduce((a, r) => a + r.rating_staffing, 0) / employerReviews.length : 0,
    safety: employerReviews.length ? employerReviews.reduce((a, r) => a + r.rating_safety, 0) / employerReviews.length : 0,
    culture: employerReviews.length ? employerReviews.reduce((a, r) => a + r.rating_culture, 0) / employerReviews.length : 0,
    management: employerReviews.length ? employerReviews.reduce((a, r) => a + r.rating_management, 0) / employerReviews.length : 0,
    pay: employerReviews.length ? employerReviews.reduce((a, r) => a + r.rating_pay_benefits, 0) / employerReviews.length : 0,
  };

  const avgHourly = employerSalaries.length
    ? employerSalaries.reduce((a, s) => a + s.hourly_rate, 0) / employerSalaries.length
    : employer.avg_hourly_rate || 0;

  const newGradSalary = employerSalaries.find(s => s.years_experience === 0)?.hourly_rate;
  const expSalary = employerSalaries.find(s => s.years_experience >= 5)?.hourly_rate;

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 text-white p-6 rounded-t-xl relative">
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-bold text-lg mb-1 pr-6">{employer.name}</h3>
        <p className="text-teal-100 text-sm">{employer.city}, {employer.state}</p>
        <div className="flex items-center gap-2 mt-3">
          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          <span className="text-2xl font-bold">{employer.rating_overall?.toFixed(1)}</span>
          <span className="text-teal-200 text-sm">({employer.review_count} reviews)</span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white border border-t-0 rounded-b-xl p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-teal-600">{employer.bed_count}</div>
            <div className="text-xs text-muted-foreground">Beds</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg text-center">
            <div className="text-2xl font-bold text-teal-600">${Math.round(avgHourly)}</div>
            <div className="text-xs text-muted-foreground">Avg Hourly</div>
          </div>
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {employer.magnet_status ? (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                <Award className="w-3 h-3" /> Magnet
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                Non-Magnet
              </span>
            )}
            {employer.union ? (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                <Users className="w-3 h-3" /> Union
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                Non-Union
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {employer.new_grad_friendly ? (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> New Grad Friendly
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">
                <XCircle className="w-3 h-3" /> Exp. Required
              </span>
            )}
          </div>
        </div>

        {/* Ratings Breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-700">Ratings Breakdown</h4>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Staffing</span>
              </div>
              <RatingBar value={avgRatings.staffing || employer.rating_overall || 0} color="teal" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Safety</span>
              </div>
              <RatingBar value={avgRatings.safety || employer.rating_overall || 0} color="green" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Culture</span>
              </div>
              <RatingBar value={avgRatings.culture || employer.rating_overall || 0} color="rose" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> Management</span>
              </div>
              <RatingBar value={avgRatings.management || employer.rating_overall || 0} color="violet" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Pay & Benefits</span>
              </div>
              <RatingBar value={avgRatings.pay || employer.rating_overall || 0} color="amber" />
            </div>
          </div>
        </div>

        {/* Salary Info */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-slate-700">Salary Data</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Grad</span>
              <span className="font-semibold">{newGradSalary ? `$${newGradSalary}/hr` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">5+ Years Exp</span>
              <span className="font-semibold">{expSalary ? `$${expSalary}/hr` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Night Differential</span>
              <span className="font-semibold">
                {employerSalaries[0]?.shift_differential ? `+$${employerSalaries[0].shift_differential}/hr` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-slate-700">Units/Specialties</h4>
          <div className="flex flex-wrap gap-1">
            {employer.specialties?.map(s => (
              <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* View Details */}
        <Link href={`/employers/${employer.id}`}>
          <Button variant="outline" className="w-full gap-2">
            View Full Profile <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export function ComparePageClient({ employers, reviews, salaries }: ComparePageClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedEmployers = selectedIds.map(id => employers.find(e => e.id === id)!).filter(Boolean);
  const availableEmployers = employers.filter(e => !selectedIds.includes(e.id));

  const addHospital = (id: string) => {
    if (selectedIds.length < 3) {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const removeHospital = (id: string) => {
    setSelectedIds(selectedIds.filter(i => i !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 rounded-full px-4 py-2 mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Compare Side-by-Side</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Hospital Comparison Tool</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare up to 3 hospitals side by side on key metrics like staffing, pay, culture, and more.
          </p>
        </div>

        {/* Hospital Selector */}
        {selectedIds.length < 3 && (
          <Card className="mb-8 max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add Hospital to Compare
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={addHospital}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a hospital..." />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployers.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <span className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        {emp.name}
                        <span className="text-muted-foreground">({emp.city})</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                {3 - selectedIds.length} slot{3 - selectedIds.length !== 1 ? 's' : ''} remaining
              </p>
            </CardContent>
          </Card>
        )}

        {/* Comparison Grid */}
        {selectedEmployers.length > 0 ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {selectedEmployers.map(emp => (
              <ComparisonColumn
                key={emp.id}
                employer={emp}
                reviews={reviews}
                salaries={salaries}
                onRemove={() => removeHospital(emp.id)}
              />
            ))}
            {selectedIds.length < 3 && (
              <div className="flex-1 min-w-[280px] border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  <Plus className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p>Add another hospital</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">No Hospitals Selected</h3>
              <p className="text-muted-foreground mb-6">
                Select hospitals from the dropdown above to start comparing.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="text-sm text-muted-foreground">Quick add:</span>
                {employers.slice(0, 3).map(emp => (
                  <Button
                    key={emp.id}
                    variant="outline"
                    size="sm"
                    onClick={() => addHospital(emp.id)}
                  >
                    {emp.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <Card className="bg-gradient-to-br from-slate-50 to-teal-50/30 border-teal-100">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500" />
                Tips for Comparing Hospitals
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Consider your priorities: Pay vs. culture vs. learning opportunities</li>
                <li>• Check if the hospital is union—this affects pay scales and job security</li>
                <li>• Magnet hospitals often have better nurse-to-patient ratios</li>
                <li>• New grad friendly hospitals offer residency programs with mentorship</li>
                <li>• Don&apos;t forget to factor in commute time and parking costs</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
