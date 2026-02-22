'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { Icons } from '@/components/ui/icons';
import { Settings } from 'lucide-react';
import Link from 'next/link';
import { ProfileSection } from '@/components/account/ProfileSection';
import { PasswordSection } from '@/components/account/PasswordSection';
import { NotificationsSection } from '@/components/account/NotificationsSection';
import { DangerZoneSection } from '@/components/account/DangerZoneSection';

export default function AccountPageClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase.auth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icons.spinner className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            <span>/</span>
            <span>Account Settings</span>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-teal-600" />
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          <ProfileSection
            email={user.email || ''}
            initialDisplayName={user.user_metadata?.display_name || ''}
          />
          <PasswordSection />
          <NotificationsSection />
          <DangerZoneSection />
        </div>
      </div>
    </div>
  );
}
