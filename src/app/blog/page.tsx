import { createClient } from "@/lib/supabase/server";
import { BlogPageClient } from "./BlogPageClient";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
    const supabase = await createClient();

    const { data: posts } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    return <BlogPageClient posts={posts || []} />;
}
