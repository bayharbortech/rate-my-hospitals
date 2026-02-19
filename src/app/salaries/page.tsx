import { getEmployers } from '@/lib/data/employers';
import { getSalaries } from '@/lib/data/salaries';
import { SalariesPageClient } from './SalariesPageClient';

export default async function SalariesPage() {
  const [employers, salaries] = await Promise.all([
    getEmployers(),
    getSalaries(),
  ]);

  return (
    <SalariesPageClient
      employers={employers}
      salaries={salaries}
    />
  );
}
