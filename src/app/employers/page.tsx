import { getEmployers } from '@/lib/data/employers';
import { EmployersPageClient } from './EmployersPageClient';

export default async function EmployersPage() {
  const employers = await getEmployers();

  return <EmployersPageClient employers={employers} />;
}
