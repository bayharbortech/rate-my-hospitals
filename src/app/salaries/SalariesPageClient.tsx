'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employer, Salary } from '@/lib/types';
import {
  DollarSign,
  TrendingUp,
  Building2,
  Briefcase,
  Clock,
  Moon,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Info
} from 'lucide-react';
import Link from 'next/link';

interface SalariesPageClientProps {
  employers: Employer[];
  salaries: Salary[];
}

type SalaryWithEmployer = Salary & { employer_name: string };

export function SalariesPageClient({ employers, salaries }: SalariesPageClientProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedHospital, setSelectedHospital] = useState<string>('all');

  // Enrich salaries with employer names
  const enrichedSalaries: SalaryWithEmployer[] = useMemo(() => {
    return salaries.map(s => ({
      ...s,
      employer_name: employers.find(e => e.id === s.employer_id)?.name || 'Unknown'
    }));
  }, [employers, salaries]);

  // Get unique values for filters
  const departments = [...new Set(salaries.map(s => s.department))].sort();
  const experienceLevels = [
    { value: 'new_grad', label: 'New Grad (0-1 years)', min: 0, max: 1 },
    { value: 'early', label: 'Early Career (2-4 years)', min: 2, max: 4 },
    { value: 'mid', label: 'Mid Career (5-9 years)', min: 5, max: 9 },
    { value: 'senior', label: 'Senior (10+ years)', min: 10, max: 99 },
  ];

  // Filter salaries
  const filteredSalaries = useMemo(() => {
    let result = enrichedSalaries;

    if (selectedDepartment !== 'all') {
      result = result.filter(s => s.department === selectedDepartment);
    }

    if (selectedExperience !== 'all') {
      const level = experienceLevels.find(l => l.value === selectedExperience);
      if (level) {
        result = result.filter(s => s.years_experience >= level.min && s.years_experience <= level.max);
      }
    }

    if (selectedHospital !== 'all') {
      result = result.filter(s => s.employer_id === selectedHospital);
    }

    return result;
  }, [enrichedSalaries, selectedDepartment, selectedExperience, selectedHospital]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (filteredSalaries.length === 0) return null;

    const rates = filteredSalaries.map(s => s.hourly_rate);
    const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const sorted = [...rates].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];

    return { avg, min, max, median, count: rates.length };
  }, [filteredSalaries]);

  // Group by hospital for comparison
  const hospitalComparison = useMemo(() => {
    const grouped: Record<string, { name: string; avgRate: number; count: number; minRate: number; maxRate: number }> = {};

    filteredSalaries.forEach(s => {
      if (!grouped[s.employer_id]) {
        grouped[s.employer_id] = {
          name: s.employer_name,
          avgRate: 0,
          count: 0,
          minRate: Infinity,
          maxRate: 0
        };
      }
      grouped[s.employer_id].avgRate += s.hourly_rate;
      grouped[s.employer_id].count += 1;
      grouped[s.employer_id].minRate = Math.min(grouped[s.employer_id].minRate, s.hourly_rate);
      grouped[s.employer_id].maxRate = Math.max(grouped[s.employer_id].maxRate, s.hourly_rate);
    });

    return Object.entries(grouped)
      .map(([id, data]) => ({
        id,
        name: data.name,
        avgRate: data.avgRate / data.count,
        count: data.count,
        minRate: data.minRate,
        maxRate: data.maxRate
      }))
      .sort((a, b) => b.avgRate - a.avgRate);
  }, [filteredSalaries]);

  // Group by department
  const departmentComparison = useMemo(() => {
    const grouped: Record<string, { avgRate: number; count: number }> = {};

    enrichedSalaries.forEach(s => {
      if (!grouped[s.department]) {
        grouped[s.department] = { avgRate: 0, count: 0 };
      }
      grouped[s.department].avgRate += s.hourly_rate;
      grouped[s.department].count += 1;
    });

    return Object.entries(grouped)
      .map(([dept, data]) => ({
        department: dept,
        avgRate: data.avgRate / data.count,
        count: data.count
      }))
      .sort((a, b) => b.avgRate - a.avgRate);
  }, [enrichedSalaries]);

  const maxAvgRate = Math.max(...hospitalComparison.map(h => h.avgRate), 1);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-4">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm font-medium">Salary Transparency</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Salary Explorer</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare real salary data submitted by nurses across Southern California hospitals.
            Filter by department, experience, and hospital.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Department</label>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Experience Level</label>
                <Select value={selectedExperience} onValueChange={setSelectedExperience}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience Levels</SelectItem>
                    {experienceLevels.map(level => (
                      <SelectItem key={level.value} value={level.value}>{level.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Hospital</label>
                <Select value={selectedHospital} onValueChange={setSelectedHospital}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Hospitals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {employers.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedExperience('all');
                    setSelectedHospital('all');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600">${stats.avg.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Average Hourly</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600">${stats.median.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Median Hourly</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-600">${stats.min.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Minimum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-slate-600">${stats.max.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Maximum</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-teal-600">{stats.count}</div>
                <div className="text-sm text-muted-foreground">Data Points</div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hospital Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Pay by Hospital
              </CardTitle>
            </CardHeader>
            <CardContent>
              {hospitalComparison.length > 0 ? (
                <div className="space-y-4">
                  {hospitalComparison.map((hospital, index) => (
                    <div key={hospital.id}>
                      <div className="flex justify-between items-center mb-1">
                        <Link href={`/employers/${hospital.id}`} className="font-medium hover:text-teal-600 transition-colors">
                          {hospital.name}
                        </Link>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-green-600">${hospital.avgRate.toFixed(0)}/hr</span>
                          {index === 0 && <ArrowUpRight className="w-4 h-4 text-green-500" />}
                          {index === hospitalComparison.length - 1 && hospitalComparison.length > 1 && (
                            <ArrowDownRight className="w-4 h-4 text-amber-500" />
                          )}
                          {index > 0 && index < hospitalComparison.length - 1 && (
                            <Minus className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${(hospital.avgRate / maxAvgRate) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-20 text-right">
                          {hospital.count} report{hospital.count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Range: ${hospital.minRate} - ${hospital.maxRate}/hr
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No salary data for selected filters</p>
              )}
            </CardContent>
          </Card>

          {/* Department Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Pay by Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentComparison.map((dept) => (
                  <div key={dept.department}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-lg font-bold text-green-600">${dept.avgRate.toFixed(0)}/hr</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                          style={{ width: `${(dept.avgRate / maxAvgRate) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {dept.count} report{dept.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Individual Salary Reports */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Individual Salary Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Hospital</th>
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Position</th>
                    <th className="py-3 px-4 text-left font-medium text-muted-foreground">Department</th>
                    <th className="py-3 px-4 text-center font-medium text-muted-foreground">
                      <Clock className="w-4 h-4 inline mr-1" />
                      Experience
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Base Rate
                    </th>
                    <th className="py-3 px-4 text-right font-medium text-muted-foreground">
                      <Moon className="w-4 h-4 inline mr-1" />
                      Night Diff
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary) => (
                    <tr key={salary.id} className="border-b hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <Link href={`/employers/${salary.employer_id}`} className="hover:text-teal-600">
                          {salary.employer_name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">{salary.position}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs">
                          {salary.department}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {salary.years_experience === 0 ? 'New Grad' : `${salary.years_experience} yrs`}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${salary.hourly_rate.toFixed(2)}/hr
                      </td>
                      <td className="py-3 px-4 text-right">
                        {salary.shift_differential ? (
                          <span className="text-blue-600">+${salary.shift_differential.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="mt-8 bg-gradient-to-br from-slate-50 to-blue-50/30 border-blue-100">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Info className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">About This Data</h3>
                <p className="text-sm text-muted-foreground">
                  Salary data is self-reported by nurses and may not reflect current rates. Use this as a
                  reference point for negotiations, not a guarantee. Factors like certifications, specialty
                  training, and negotiation skills can significantly impact your actual offer.
                </p>
                <Link href="/reviews/submit" className="text-sm text-teal-600 hover:underline mt-2 inline-block">
                  Contribute your salary data →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
