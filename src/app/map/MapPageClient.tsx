'use client';

import { useState, useMemo, lazy, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Employer } from '@/lib/types';
import {
  MapPin,
  Star,
  Building2,
  Navigation,
  List,
  Search,
  ExternalLink,
  Award,
  Users,
  GraduationCap,
  Map
} from 'lucide-react';
import Link from 'next/link';

// Lazy load the map component to avoid SSR issues
const InteractiveMap = lazy(() => import('./InteractiveMap').then(mod => ({ default: mod.InteractiveMap })));

interface MapPageClientProps {
  employers: Employer[];
}

// Group hospitals by region based on city
const getRegion = (city: string): string => {
  const regions: Record<string, string[]> = {
    'Los Angeles': ['Los Angeles', 'Beverly Hills', 'Hollywood', 'West Hollywood'],
    'Westside': ['Santa Monica', 'Culver City', 'Venice', 'Malibu', 'Pacific Palisades'],
    'South Bay': ['Long Beach', 'Torrance', 'Redondo Beach', 'Manhattan Beach'],
    'Orange County': ['Newport Beach', 'Irvine', 'Anaheim', 'Orange', 'Costa Mesa', 'Huntington Beach'],
    'San Fernando Valley': ['Burbank', 'Glendale', 'Pasadena', 'Sherman Oaks'],
  };

  for (const [region, cities] of Object.entries(regions)) {
    if (cities.some(c => city.toLowerCase().includes(c.toLowerCase()))) {
      return region;
    }
  }
  return 'Other';
};

// Get rating color class
const getRatingColor = (rating: number): string => {
  if (rating >= 4.5) return 'bg-green-500';
  if (rating >= 4.0) return 'bg-teal-500';
  if (rating >= 3.5) return 'bg-blue-500';
  if (rating >= 3.0) return 'bg-amber-500';
  return 'bg-red-500';
};

type ViewMode = 'list' | 'map';

export function MapPageClient({ employers }: MapPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('rating');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Get all regions
  const regions = useMemo(() => {
    const regionSet = new Set(employers.map(e => getRegion(e.city)));
    return Array.from(regionSet).sort();
  }, [employers]);

  // Filter and sort hospitals
  const filteredHospitals = useMemo(() => {
    let result = [...employers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.city.toLowerCase().includes(query) ||
        e.address.toLowerCase().includes(query)
      );
    }

    if (selectedRegion !== 'all') {
      result = result.filter(e => getRegion(e.city) === selectedRegion);
    }

    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => (b.rating_overall || 0) - (a.rating_overall || 0));
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'city':
        result.sort((a, b) => a.city.localeCompare(b.city));
        break;
    }

    return result;
  }, [employers, searchQuery, selectedRegion, sortBy]);

  // Group by region for map view
  const hospitalsByRegion = useMemo(() => {
    const grouped: Record<string, Employer[]> = {};

    filteredHospitals.forEach(hospital => {
      const region = getRegion(hospital.city);
      if (!grouped[region]) {
        grouped[region] = [];
      }
      grouped[region].push(hospital);
    });

    return grouped;
  }, [filteredHospitals]);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">Geographic View</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Hospital Map</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore hospitals by location across Southern California regions.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, city, or address..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="city">City (A-Z)</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" /> List
                </Button>
                <Button
                  variant={viewMode === 'map' ? 'default' : 'outline'}
                  className="gap-2"
                  onClick={() => setViewMode('map')}
                >
                  <Map className="h-4 w-4" /> Map
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Map Legend */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Rating:</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> 4.5+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-teal-500"></span> 4.0+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> 3.5+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500"></span> 3.0+</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> Below 3.0</span>
          </div>
        </div>

        {/* View Toggle Content */}
        {viewMode === 'map' ? (
          /* Interactive Map View */
          <Suspense fallback={
            <div className="w-full h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-pulse" />
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            </div>
          }>
            <InteractiveMap employers={filteredHospitals} />
          </Suspense>
        ) : (
          /* List View */
          <>
            {/* Region Cards */}
            <div className="space-y-8">
              {Object.entries(hospitalsByRegion).map(([region, hospitals]) => (
                <Card key={region} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 border-b">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-teal-600" />
                        {region}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">
                        {hospitals.length} hospital{hospitals.length !== 1 ? 's' : ''}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {hospitals.map((hospital) => (
                        <div
                          key={hospital.id}
                          className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-4"
                        >
                          {/* Rating Indicator */}
                          <div className="flex-shrink-0">
                            <div className={`w-12 h-12 rounded-lg ${getRatingColor(hospital.rating_overall || 0)} flex items-center justify-center text-white font-bold`}>
                              {hospital.rating_overall?.toFixed(1)}
                            </div>
                          </div>

                          {/* Hospital Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <Link
                                  href={`/employers/${hospital.id}`}
                                  className="font-semibold text-lg hover:text-teal-600 transition-colors"
                                >
                                  {hospital.name}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{hospital.address}, {hospital.city}, {hospital.state} {hospital.zip_code}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Star className="w-4 h-4 text-amber-400" />
                                    {hospital.review_count} reviews
                                  </span>
                                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {hospital.bed_count} beds
                                  </span>
                                  {hospital.avg_hourly_rate && (
                                    <span className="text-sm text-green-600 font-medium">
                                      ~${hospital.avg_hourly_rate}/hr
                                    </span>
                                  )}
                                </div>
                                {/* Badges */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {hospital.magnet_status && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                      <Award className="w-3 h-3" /> Magnet
                                    </span>
                                  )}
                                  {hospital.union && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                      <Users className="w-3 h-3" /> Union
                                    </span>
                                  )}
                                  {hospital.new_grad_friendly && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                      <GraduationCap className="w-3 h-3" /> New Grad
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                <Link href={`/employers/${hospital.id}`}>
                                  <Button size="sm" className="gap-1">
                                    View <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </Link>
                                {hospital.website && (
                                  <a
                                    href={hospital.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-muted-foreground hover:text-teal-600 text-center"
                                  >
                                    Website →
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {Object.keys(hospitalsByRegion).length === 0 && (
              <Card className="py-16 text-center">
                <CardContent>
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <h3 className="text-xl font-semibold mb-2">No Hospitals Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your search or region filter
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedRegion('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{employers.length}</div>
              <div className="text-sm text-muted-foreground">Total Hospitals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">{regions.length}</div>
              <div className="text-sm text-muted-foreground">Regions Covered</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {employers.filter(e => e.magnet_status).length}
              </div>
              <div className="text-sm text-muted-foreground">Magnet Hospitals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-teal-600">
                {employers.filter(e => e.new_grad_friendly).length}
              </div>
              <div className="text-sm text-muted-foreground">New Grad Friendly</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
