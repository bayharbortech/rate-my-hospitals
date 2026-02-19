import { getEmployers } from '@/lib/data/employers';
import { MapPageClient } from './MapPageClient';

export default async function MapPage() {
  const employers = await getEmployers();

  return <MapPageClient employers={employers} />;
}
