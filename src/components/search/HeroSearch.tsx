'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/search');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 p-2">
      <Search className="absolute left-5 h-5 w-5 text-slate-400" />
      <Input
        type="text"
        placeholder="Search hospitals by name or location..."
        className="pl-12 h-14 text-lg text-slate-900 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        type="submit"
        className="rounded-xl px-8 h-12 bg-teal-600 hover:bg-teal-700 text-white font-semibold"
        size="lg"
      >
        Search
      </Button>
    </form>
  );
}
