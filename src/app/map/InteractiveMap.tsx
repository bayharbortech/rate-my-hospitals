'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Employer } from '@/lib/types';
import { Star, Building2, MapPin, ExternalLink, Award, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

interface InteractiveMapProps {
  employers: Employer[];
}

// Fix Leaflet default marker icon issue in Next.js
const createCustomIcon = (rating: number) => {
  let color = '#ef4444'; // red
  if (rating >= 4.5) color = '#22c55e'; // green
  else if (rating >= 4.0) color = '#14b8a6'; // teal
  else if (rating >= 3.5) color = '#3b82f6'; // blue
  else if (rating >= 3.0) color = '#f59e0b'; // amber

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 12px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        ${rating?.toFixed(1) || 'N/A'}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Component to fit bounds to markers
function FitBounds({ employers }: { employers: Employer[] }) {
  const map = useMap();

  useEffect(() => {
    if (employers.length === 0) return;

    const validEmployers = employers.filter(e => e.latitude && e.longitude);
    if (validEmployers.length === 0) return;

    const bounds = L.latLngBounds(
      validEmployers.map(e => [e.latitude!, e.longitude!] as [number, number])
    );

    map.fitBounds(bounds, { padding: [50, 50] });
  }, [employers, map]);

  return null;
}

// Default center for Southern California
const DEFAULT_CENTER: [number, number] = [34.0522, -118.2437];
const DEFAULT_ZOOM = 10;

export function InteractiveMap({ employers }: InteractiveMapProps) {
  // Use a ref to track mount state to avoid hydration issues with Leaflet
  const [isMounted, setIsMounted] = useState(() => {
    // Check if we're on the client side
    return typeof window !== 'undefined';
  });

  // Handle case where initial state was false (SSR)
  useEffect(() => {
    if (!isMounted) {
      // Use requestAnimationFrame to defer the state update
      requestAnimationFrame(() => {
        setIsMounted(true);
      });
    }
  }, [isMounted]);

  // Filter employers with valid coordinates
  const mappableEmployers = employers.filter(e => e.latitude && e.longitude);

  // Don't render on server
  if (!isMounted) {
    return (
      <div className="w-full h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-400 animate-pulse" />
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (mappableEmployers.length === 0) {
    return (
      <div className="w-full h-[600px] bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-xl font-semibold mb-2">No Map Data Available</h3>
          <p className="text-muted-foreground">
            Hospital locations are being added. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden border shadow-sm">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds employers={mappableEmployers} />

        {mappableEmployers.map((hospital) => (
          <Marker
            key={hospital.id}
            position={[hospital.latitude!, hospital.longitude!]}
            icon={createCustomIcon(hospital.rating_overall || 0)}
          >
            <Popup className="hospital-popup" maxWidth={320}>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{hospital.name}</h3>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>{hospital.city}, {hospital.state}</span>
                </div>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">{hospital.rating_overall?.toFixed(1) || 'N/A'}</span>
                    <span className="text-sm text-gray-500">({hospital.review_count} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <Building2 className="w-4 h-4" />
                  <span>{hospital.bed_count || 'N/A'} beds</span>
                  {hospital.avg_hourly_rate && (
                    <span className="text-green-600 font-medium ml-2">
                      ~${hospital.avg_hourly_rate}/hr
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-3">
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

                <Link href={`/employers/${hospital.id}`}>
                  <Button size="sm" className="w-full gap-1">
                    View Details <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
