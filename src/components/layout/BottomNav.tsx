'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, User, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/employers', label: 'Explore', icon: Search },
    { href: '/reviews/submit', label: 'Review', icon: PlusCircle },
    { href: '/blog', label: 'Blog', icon: BookOpen },
    { href: '/dashboard', label: 'Account', icon: User },
];

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.06)]"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
            <div className="flex items-center justify-around h-14">
                {NAV_ITEMS.map(item => {
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center gap-0.5 w-full h-full text-xs transition-colors ${
                                active
                                    ? 'text-teal-600'
                                    : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5px]' : ''}`} />
                            <span className={active ? 'font-semibold' : 'font-medium'}>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
