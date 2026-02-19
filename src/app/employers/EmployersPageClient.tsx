'use client';

import { useState, useMemo } from 'react';
import { EmployerCard } from '@/components/employers/EmployerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Search,
  SlidersHorizontal,
  X,
  Building2,
  Award,
  Users,
  GraduationCap,
  Sun,
  Moon,
  RefreshCw,
  MapPin,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Employer } from '@/lib/types';

const ALL_SPECIALTIES = ['ICU', 'ER', 'Med-Surg', 'L&D', 'NICU', 'Cardiac', 'Oncology', 'Neuro', 'Ortho', 'Psych'];

interface EmployersPageClientProps {
  employers: Employer[];
}

export function EmployersPageClient({ employers }: EmployersPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [magnetOnly, setMagnetOnly] = useState(false);
  const [unionOnly, setUnionOnly] = useState(false);
  const [newGradOnly, setNewGradOnly] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [minPay, setMinPay] = useState(0);

  const filteredEmployers = useMemo(() => {
    let result = [...employers];

    // Text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.zip_code.includes(query) ||
        e.health_system?.toLowerCase().includes(query)
      );
    }

    // Specialty filter
    if (selectedSpecialties.length > 0) {
      result = result.filter(e =>
        selectedSpecialties.some(s => e.specialties?.includes(s))
      );
    }

    // Magnet filter
    if (magnetOnly) {
      result = result.filter(e => e.magnet_status);
    }

    // Union filter
    if (unionOnly) {
      result = result.filter(e => e.union);
    }

    // New grad filter
    if (newGradOnly) {
      result = result.filter(e => e.new_grad_friendly);
    }

    // Shift filter
    if (selectedShifts.length > 0) {
      result = result.filter(e =>
        selectedShifts.some(s => e.shift_types?.includes(s as 'day' | 'night' | 'rotating'))
      );
    }

    // Minimum pay filter
    if (minPay > 0) {
      result = result.filter(e => (e.avg_hourly_rate || 0) >= minPay);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating_overall || 0) - (a.rating_overall || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'pay':
        result.sort((a, b) => (b.avg_hourly_rate || 0) - (a.avg_hourly_rate || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [employers, searchQuery, sortBy, selectedSpecialties, magnetOnly, unionOnly, newGradOnly, selectedShifts, minPay]);

  const toggleSpecialty = (specialty: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

  const toggleShift = (shift: string) => {
    setSelectedShifts(prev =>
      prev.includes(shift)
        ? prev.filter(s => s !== shift)
        : [...prev, shift]
    );
  };

  const clearAllFilters = () => {
    setSelectedSpecialties([]);
    setMagnetOnly(false);
    setUnionOnly(false);
    setNewGradOnly(false);
    setSelectedShifts([]);
    setMinPay(0);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedSpecialties.length > 0 || magnetOnly || unionOnly || newGradOnly || selectedShifts.length > 0 || minPay > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Hospitals</h1>
            <p className="text-muted-foreground">Find and compare healthcare employers in Southern California</p>
          </div>
          <div className="flex gap-2">
            <Link href="/map">
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" /> Map View
              </Button>
            </Link>
            <Link href="/compare">
              <Button variant="outline" className="gap-2">
                <ArrowRightLeft className="h-4 w-4" /> Compare
              </Button>
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, zip, or health system..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="pay">Highest Pay</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="bg-white text-primary rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 border-teal-200 bg-gradient-to-br from-white to-teal-50/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-muted-foreground gap-1">
                    <X className="w-4 h-4" /> Clear All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Specialties */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Specialties/Units
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {ALL_SPECIALTIES.map(specialty => (
                      <button
                        key={specialty}
                        onClick={() => toggleSpecialty(specialty)}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          selectedSpecialties.includes(specialty)
                            ? 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {specialty}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Certifications/Features */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Hospital Features
                  </Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="magnet"
                        checked={magnetOnly}
                        onCheckedChange={(checked) => setMagnetOnly(checked as boolean)}
                      />
                      <label htmlFor="magnet" className="text-sm cursor-pointer">
                        Magnet Designated
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="union"
                        checked={unionOnly}
                        onCheckedChange={(checked) => setUnionOnly(checked as boolean)}
                      />
                      <label htmlFor="union" className="text-sm cursor-pointer flex items-center gap-1">
                        <Users className="w-3 h-3" /> Union Hospital
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newgrad"
                        checked={newGradOnly}
                        onCheckedChange={(checked) => setNewGradOnly(checked as boolean)}
                      />
                      <label htmlFor="newgrad" className="text-sm cursor-pointer flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> New Grad Friendly
                      </label>
                    </div>
                  </div>
                </div>

                {/* Shift Types */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Sun className="w-4 h-4" /> Shift Types Available
                  </Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="day"
                        checked={selectedShifts.includes('day')}
                        onCheckedChange={() => toggleShift('day')}
                      />
                      <label htmlFor="day" className="text-sm cursor-pointer flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Day Shift
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="night"
                        checked={selectedShifts.includes('night')}
                        onCheckedChange={() => toggleShift('night')}
                      />
                      <label htmlFor="night" className="text-sm cursor-pointer flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Night Shift
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rotating"
                        checked={selectedShifts.includes('rotating')}
                        onCheckedChange={() => toggleShift('rotating')}
                      />
                      <label htmlFor="rotating" className="text-sm cursor-pointer flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" /> Rotating
                      </label>
                    </div>
                  </div>
                </div>

                {/* Pay Range */}
                <div>
                  <Label className="text-sm font-medium mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Minimum Hourly Pay
                  </Label>
                  <div className="mt-4 px-2">
                    <Slider
                      value={[minPay]}
                      onValueChange={(value) => setMinPay(value[0])}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>$0/hr</span>
                      <span className="font-semibold text-teal-600">${minPay}/hr+</span>
                      <span>$100/hr</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredEmployers.length}</span> hospitals
            {hasActiveFilters && ' (filtered)'}
          </p>
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {magnetOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                  Magnet <X className="w-3 h-3 cursor-pointer" onClick={() => setMagnetOnly(false)} />
                </span>
              )}
              {unionOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                  Union <X className="w-3 h-3 cursor-pointer" onClick={() => setUnionOnly(false)} />
                </span>
              )}
              {newGradOnly && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  New Grad <X className="w-3 h-3 cursor-pointer" onClick={() => setNewGradOnly(false)} />
                </span>
              )}
              {selectedSpecialties.map(s => (
                <span key={s} className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                  {s} <X className="w-3 h-3 cursor-pointer" onClick={() => toggleSpecialty(s)} />
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {filteredEmployers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployers.map((employer) => (
              <EmployerCard key={employer.id} employer={employer} />
            ))}
          </div>
        ) : (
          <Card className="py-16 text-center">
            <CardContent>
              <Building2 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">No Hospitals Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or search query
              </p>
              <Button variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
