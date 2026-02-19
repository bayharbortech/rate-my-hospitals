import { getEmployers, getEmployerStates, getEmployerHealthSystems } from '@/lib/data/employers';
import { SearchPageClient } from './SearchPageClient';

export default async function SearchPage() {
  const [employers, states, healthSystems] = await Promise.all([
    getEmployers(),
    getEmployerStates(),
    getEmployerHealthSystems(),
  ]);

  return (
    <SearchPageClient
      employers={employers}
      states={states}
      healthSystems={healthSystems}
    />
  );
}
