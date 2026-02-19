import Link from 'next/link';
import { Stethoscope, DollarSign, ArrowRightLeft, MapPin, ChevronDown } from 'lucide-react';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AuthNavigation } from './AuthNavigation';
import { MobileNav } from './MobileNav';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export async function Header() {
    const user = await getCurrentUser();

    const isAdmin = user ? await isUserAdmin(user.id) : false;

    let pendingCount = 0;
    if (isAdmin) {
        const supabase = await createClient();
        const { count } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending');
        pendingCount = count || 0;
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                    <MobileNav isLoggedIn={!!user} isAdmin={isAdmin} pendingCount={pendingCount} />
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Stethoscope className="h-6 w-6" />
                        <span>RateMyHospital</span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {/* Explore Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-1 px-2">
                                Explore <ChevronDown className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link href="/employers" className="flex items-center gap-2 cursor-pointer">
                                    <Stethoscope className="w-4 h-4" />
                                    Browse Hospitals
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/map" className="flex items-center gap-2 cursor-pointer">
                                    <MapPin className="w-4 h-4" />
                                    Map View
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/compare" className="flex items-center gap-2 cursor-pointer">
                                    <ArrowRightLeft className="w-4 h-4" />
                                    Compare Hospitals
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/salaries" className="flex items-center gap-2 cursor-pointer">
                                    <DollarSign className="w-4 h-4" />
                                    Salary Explorer
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/reviews/submit" className="transition-colors hover:text-primary">
                        Write a Review
                    </Link>
                    <Link href="/blog" className="transition-colors hover:text-primary">
                        Blog
                    </Link>
                    {user && (
                        <Link href="/dashboard" className="transition-colors hover:text-primary">
                            Dashboard
                        </Link>
                    )}
                    {isAdmin && (
                        <Link href="/admin" className="relative transition-colors hover:text-primary text-purple-600 font-semibold">
                            Admin
                            {pendingCount > 0 && (
                                <span className="absolute -top-2 -right-5 inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                    {pendingCount}
                                </span>
                            )}
                        </Link>
                    )}
                </nav>

                <AuthNavigation user={user} />
            </div>
        </header>
    );
}
