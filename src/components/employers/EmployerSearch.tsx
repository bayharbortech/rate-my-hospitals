'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { mockEmployers } from '@/lib/mock-data';
import { Employer } from '@/lib/types';
import Link from 'next/link';

interface EmployerSearchProps {
    placeholder?: string;
    onSelect?: (employer: Employer) => void;
    className?: string;
}

export function EmployerSearch({ placeholder = "Search hospitals...", onSelect, className }: EmployerSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Employer[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (query.length > 1) {
            const filtered = mockEmployers.filter(e =>
                e.name.toLowerCase().includes(query.toLowerCase()) ||
                e.city.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filtered);
            setIsOpen(true);
        } else {
            setResults([]);
            setIsOpen(false);
        }
    }, [query]);

    const handleSelect = (employer: Employer) => {
        if (onSelect) {
            onSelect(employer);
            setQuery('');
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md border shadow-lg max-h-60 overflow-auto">
                    {results.map(employer => (
                        <div
                            key={employer.id}
                            className="p-3 hover:bg-slate-50 cursor-pointer border-b last:border-none"
                            onClick={() => handleSelect(employer)}
                        >
                            {onSelect ? (
                                <div>
                                    <div className="font-medium">{employer.name}</div>
                                    <div className="text-xs text-muted-foreground">{employer.city}, {employer.state}</div>
                                </div>
                            ) : (
                                <Link href={`/employers/${employer.id}`} className="block">
                                    <div className="font-medium">{employer.name}</div>
                                    <div className="text-xs text-muted-foreground">{employer.city}, {employer.state}</div>
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
