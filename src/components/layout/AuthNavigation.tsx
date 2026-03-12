'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { Icons } from '@/components/ui/icons'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { User as UserIcon, Settings, LogOut, ChevronDown } from 'lucide-react'

interface AuthNavigationProps {
    user: User | null
}

export function AuthNavigation({ user }: AuthNavigationProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    const handleSignOut = async () => {
        setLoading(true)
        await supabase.auth.signOut()
        router.refresh()
        setLoading(false)
    }

    if (user) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <UserIcon className="w-3.5 h-3.5 text-teal-600" />
                        </div>
                        <span className="hidden sm:inline-block max-w-[150px] truncate">
                            {user.user_metadata?.display_name || user.email}
                        </span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                        <p className="text-sm font-medium truncate">
                            {user.user_metadata?.display_name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                        </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/account" className="cursor-pointer">
                            <Settings className="w-4 h-4 mr-2" />
                            Account Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        disabled={loading}
                        className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                        {loading ? (
                            <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <LogOut className="w-4 h-4 mr-2" />
                        )}
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/login">
                <Button variant="ghost" size="sm">
                    Log in
                </Button>
            </Link>
            <Link href="/login?view=signup">
                <Button size="sm">
                    Sign up
                </Button>
            </Link>
        </div>
    )
}
