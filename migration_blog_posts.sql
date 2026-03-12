-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id serial PRIMARY KEY,
    title text NOT NULL,
    summary text NOT NULL,
    category text NOT NULL CHECK (category IN ('Career', 'Working Conditions', 'Salary', 'Wellness', 'Education', 'Tech', 'Tips')),
    date text NOT NULL,
    read_time text NOT NULL,
    image text NOT NULL DEFAULT '/images/blog/default.jpg',
    content text NOT NULL,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_by uuid REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can read published posts
CREATE POLICY "Public can read published blog posts"
    ON blog_posts FOR SELECT
    USING (status = 'published');

-- Admins can do everything
CREATE POLICY "Admins can manage blog posts"
    ON blog_posts FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.is_admin = true
        )
    );
