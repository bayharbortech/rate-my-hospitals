import { createClient } from '@/lib/supabase/server';
import { getCurrentUser, isUserAdmin } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { UserManagement } from '@/components/admin/UserManagement';
import { BlogManagement } from '@/components/admin/BlogManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (!(await isUserAdmin(user.id))) {
        redirect('/');
    }

    const supabase = await createClient();

    // Fetch pending reviews with employer name
    const { data: reviews } = await supabase
        .from('reviews')
        .select(`
            *,
            employer:employers(name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

    // Fetch all users
    const { data: users } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="container max-w-5xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <Tabs defaultValue="reviews">
                <TabsList className="mb-8">
                    <TabsTrigger value="reviews">
                        Pending Reviews
                        {(reviews?.length ?? 0) > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full">
                                {reviews!.length}
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="blog">Blog Posts</TabsTrigger>
                </TabsList>

                <TabsContent value="reviews">
                    <h2 className="text-xl font-semibold mb-4">Pending Reviews</h2>
                    <AdminDashboard reviews={(reviews || []) as React.ComponentProps<typeof AdminDashboard>['reviews']} />
                </TabsContent>

                <TabsContent value="users">
                    <h2 className="text-xl font-semibold mb-4">Users</h2>
                    <UserManagement users={users || []} />
                </TabsContent>

                <TabsContent value="blog">
                    <h2 className="text-xl font-semibold mb-4">Blog Posts</h2>
                    <BlogManagement />
                </TabsContent>
            </Tabs>
        </div>
    );
}
