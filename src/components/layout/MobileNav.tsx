'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import {
    Menu, Stethoscope, MapPin, ArrowRightLeft, DollarSign,
    PenSquare, BookOpen, LayoutDashboard, ShieldCheck, X,
} from 'lucide-react';

interface MobileNavProps {
    isLoggedIn: boolean;
    isAdmin: boolean;
    pendingCount: number;
}

const NAV_LINKS = [
    { href: '/employers', label: 'Browse Hospitals', icon: Stethoscope },
    { href: '/map', label: 'Map View', icon: MapPin },
    { href: '/compare', label: 'Compare Hospitals', icon: ArrowRightLeft },
    { href: '/salaries', label: 'Salary Explorer', icon: DollarSign },
];

const ACTION_LINKS = [
    { href: '/reviews/submit', label: 'Write a Review', icon: PenSquare },
    { href: '/blog', label: 'Blog', icon: BookOpen },
];

export function MobileNav({ isLoggedIn, isAdmin, pendingCount }: MobileNavProps) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
                <SheetHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2 text-primary">
                            <Stethoscope className="h-5 w-5" />
                            RateMyHospital
                        </SheetTitle>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <Separator />

                <nav className="flex flex-col py-2">
                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Explore
                    </div>
                    {NAV_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                isActive(link.href)
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}

                    <Separator className="my-2" />

                    {ACTION_LINKS.map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                isActive(link.href)
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Link>
                    ))}

                    {isLoggedIn && (
                        <Link
                            href="/dashboard"
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                isActive('/dashboard')
                                    ? 'bg-teal-50 text-teal-700 font-medium'
                                    : 'text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </Link>
                    )}

                    {isAdmin && (
                        <>
                            <Separator className="my-2" />
                            <Link
                                href="/admin"
                                onClick={() => setOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                                    isActive('/admin')
                                        ? 'bg-purple-50 text-purple-700 font-medium'
                                        : 'text-purple-600 hover:bg-purple-50'
                                }`}
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Admin
                                {pendingCount > 0 && (
                                    <span className="ml-auto inline-flex items-center justify-center h-5 min-w-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                                        {pendingCount}
                                    </span>
                                )}
                            </Link>
                        </>
                    )}
                </nav>
            </SheetContent>
        </Sheet>
    );
}
