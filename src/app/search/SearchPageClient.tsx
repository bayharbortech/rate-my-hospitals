'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { EmployerCard } from '@/components/employers/EmployerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Search,
  SlidersHorizontal,
  X,
  Building2,
  MapPin,
  ArrowRightLeft,
  Star,
  Users,
  GraduationCap,
  Award,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Employer } from '@/lib/types';

const RESULTS_PER_PAGE = 9;

interface SearchPageClientProps {
  employers: Employer[];
  states: string[];
  healthSystems: string[];
}

function SearchContent({ employers, states, healthSystems }: SearchPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get initial query from URL
  const initialQuery = searchParams.get('q') || '';

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [minRating, setMinRating] = useState<string>('all');
  const [magnetOnly, setMagnetOnly] = useState(false);
  const [unionOnly, setUnionOnly] = useState(false);
  const [newGradOnly, setNewGradOnly] = useState(false);

  // Update URL when search query changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    const newUrl = params.toString() ? `?${params.toString()}` : '/search';
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, router]);

  // Update search when URL changes externally
  useEffect(() => {
    const urlQuery = searchParams.get('q') || '';
    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Filter and sort employers
  const filteredEmployers = useMemo(() => {
    let result = [...employers];

    // Text search (name, city, state, health system, specialties)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.city.toLowerCase().includes(query) ||
          e.state.toLowerCase().includes(query) ||
          e.zip_code.includes(query) ||
          e.health_system?.toLowerCase().includes(query) ||
          e.specialties?.some((s) => s.toLowerCase().includes(query))
      );
    }

    // State filter
    if (selectedState !== 'all') {
      result = result.filter((e) => e.state === selectedState);
    }

    // Health system filter
    if (selectedSystem !== 'all') {
      result = result.filter((e) => e.health_system === selectedSystem);
    }

    // Rating filter
    if (minRating !== 'all') {
      const rating = parseFloat(minRating);
      result = result.filter((e) => (e.rating_overall || 0) >= rating);
    }

    // Magnet filter
    if (magnetOnly) {
      result = result.filter((e) => e.magnet_status);
    }

    // Union filter
    if (unionOnly) {
      result = result.filter((e) => e.union);
    }

    // New grad filter
    if (newGradOnly) {
      result = result.filter((e) => e.new_grad_friendly);
    }

    // Sort
    switch (sortBy) {
      case 'relevance':
        // Keep original order (matches come first naturally)
        break;
      case 'rating':
        result.sort((a, b) => (b.rating_overall || 0) - (a.rating_overall || 0));
        break;
      case 'reviews':
        result.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [
    employers,
    searchQuery,
    sortBy,
    selectedState,
    selectedSystem,
    minRating,
    magnetOnly,
    unionOnly,
    newGradOnly,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployers.length / RESULTS_PER_PAGE);
  const paginatedResults = filteredEmployers.slice(
    (currentPage - 1) * RESULTS_PER_PAGE,
    currentPage * RESULTS_PER_PAGE
  );

  // Reset page when filters change
  const handleFilterChange = <T,>(setter: (value: T) => void, value: T) => {
    setter(value);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedState('all');
    setSelectedSystem('all');
    setMinRating('all');
    setMagnetOnly(false);
    setUnionOnly(false);
    setNewGradOnly(false);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    selectedState !== 'all' ||
    selectedSystem !== 'all' ||
    minRating !== 'all' ||
    magnetOnly ||
    unionOnly ||
    newGradOnly;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Search Hospitals</h1>
            <p className="text-muted-foreground">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : 'Find healthcare employers by name, location, or specialty'}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/employers">
              <Button variant="outline" className="gap-2">
                <Building2 className="h-4 w-4" /> Browse All
              </Button>
            </Link>
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
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by hospital name, city, state, or specialty..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Most Relevant</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="reviews">Most Reviews</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant={showFilters ? 'default' : 'outline'}
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
            </form>
          </CardContent>
        </Card>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 border-teal-200 bg-gradient-to-br from-white to-teal-50/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-lg">Filters</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-muted-foreground gap-1"
                  >
                    <X className="w-4 h-4" /> Clear All
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* State */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> State
                  </Label>
                  <Select
                    value={selectedState}
                    onValueChange={(v) => handleFilterChange(setSelectedState, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All states" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All states</SelectItem>
                      {states.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Health System */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Health System
                  </Label>
                  <Select
                    value={selectedSystem}
                    onValueChange={(v) => handleFilterChange(setSelectedSystem, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All systems" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All systems</SelectItem>
                      {healthSystems.map((system) => (
                        <SelectItem key={system} value={system}>
                          {system}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Minimum Rating */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Star className="w-4 h-4" /> Minimum Rating
                  </Label>
                  <Select
                    value={minRating}
                    onValueChange={(v) => handleFilterChange(setMinRating, v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any rating</SelectItem>
                      <SelectItem value="4.5">4.5+ stars</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="3.5">3.5+ stars</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Features */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Award className="w-4 h-4" /> Features
                  </Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="magnet-search"
                        checked={magnetOnly}
                        onCheckedChange={(checked) =>
                          handleFilterChange(setMagnetOnly, checked as boolean)
                        }
                      />
                      <label htmlFor="magnet-search" className="text-sm cursor-pointer">
                        Magnet Designated
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="union-search"
                        checked={unionOnly}
                        onCheckedChange={(checked) =>
                          handleFilterChange(setUnionOnly, checked as boolean)
                        }
                      />
                      <label
                        htmlFor="union-search"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <Users className="w-3 h-3" /> Union Hospital
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="newgrad-search"
                        checked={newGradOnly}
                        onCheckedChange={(checked) =>
                          handleFilterChange(setNewGradOnly, checked as boolean)
                        }
                      />
                      <label
                        htmlFor="newgrad-search"
                        className="text-sm cursor-pointer flex items-center gap-1"
                      >
                        <GraduationCap className="w-3 h-3" /> New Grad Friendly
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full">
                {selectedState}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedState, 'all')}
                />
              </span>
            )}
            {selectedSystem !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {selectedSystem}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setSelectedSystem, 'all')}
                />
              </span>
            )}
            {minRating !== 'all' && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                {minRating}+ stars
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setMinRating, 'all')}
                />
              </span>
            )}
            {magnetOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Magnet
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setMagnetOnly, false)}
                />
              </span>
            )}
            {unionOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Union
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setUnionOnly, false)}
                />
              </span>
            )}
            {newGradOnly && (
              <span className="inline-flex items-center gap-1 text-xs bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full">
                New Grad Friendly
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleFilterChange(setNewGradOnly, false)}
                />
              </span>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredEmployers.length === 0 ? (
              'No results found'
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-foreground">
                  {(currentPage - 1) * RESULTS_PER_PAGE + 1}-
                  {Math.min(currentPage * RESULTS_PER_PAGE, filteredEmployers.length)}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-foreground">
                  {filteredEmployers.length}
                </span>{' '}
                hospitals
                {searchQuery && ` for "${searchQuery}"`}
              </>
            )}
          </p>
        </div>

        {/* Results Grid */}
        {paginatedResults.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedResults.map((employer) => (
                <EmployerCard key={employer.id} employer={employer} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page ? 'bg-teal-600 hover:bg-teal-700' : ''
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="py-16 text-center">
            <CardContent>
              <Search className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No Hospitals Found' : 'Start Your Search'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? `We couldn't find any hospitals matching "${searchQuery}". Try a different search term or adjust your filters.`
                  : 'Enter a hospital name, city, state, or specialty to find healthcare employers.'}
              </p>
              <div className="flex gap-3 justify-center">
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      clearAllFilters();
                    }}
                  >
                    Clear Search
                  </Button>
                )}
                <Link href="/employers">
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    Browse All Hospitals
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Search Suggestions */}
        {!searchQuery && filteredEmployers.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Popular Searches</h3>
            <div className="flex flex-wrap gap-2">
              {['Los Angeles', 'ICU', 'Magnet', 'Kaiser', 'UCLA', 'New Grad'].map(
                (term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(term)}
                    className="rounded-full"
                  >
                    {term}
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SearchLoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mb-4" />
          <p className="text-muted-foreground">Loading search...</p>
        </div>
      </div>
    </div>
  );
}

export function SearchPageClient({ employers, states, healthSystems }: SearchPageClientProps) {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <SearchContent employers={employers} states={states} healthSystems={healthSystems} />
    </Suspense>
  );
}
