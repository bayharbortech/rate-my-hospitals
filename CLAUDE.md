# CLAUDE.md - AI Assistant Guide for Rate My Hospitals

## Project Overview

Rate My Hospitals (internally "nurse-app") is a platform for nurses to rate and review workplace experiences at Southern California healthcare facilities. Nurses can share insights on staffing, safety, pay, culture, and management.

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.0.3 | React framework with App Router |
| React | 19.2.0 | UI library |
| TypeScript | 5.x | Type safety (strict mode) |
| Tailwind CSS | 4.x | Styling |
| Shadcn/ui | new-york style | UI component library |
| Supabase | 2.86.0 | Backend (auth, PostgreSQL database) |
| Lucide React | 0.554.0 | Icon library |

## Project Structure

```
rate-my-hospitals/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard
│   │   ├── auth/callback/      # OAuth callback route
│   │   ├── blog/               # Blog pages (list + [id] detail)
│   │   ├── compare/            # Hospital comparison tool
│   │   ├── contact/            # Contact page
│   │   ├── dashboard/          # User dashboard
│   │   ├── disclaimer/         # Legal disclaimer
│   │   ├── employers/          # Hospital directory + [id] detail
│   │   ├── guidelines/         # Community guidelines
│   │   ├── login/              # Authentication page
│   │   ├── privacy/            # Privacy policy
│   │   ├── reviews/submit/     # Review submission form
│   │   ├── search/             # Search page
│   │   ├── terms/              # Terms of service
│   │   ├── layout.tsx          # Root layout with Header/Footer
│   │   ├── page.tsx            # Homepage
│   │   └── globals.css         # Global styles + Tailwind
│   ├── components/
│   │   ├── admin/              # Admin components (UserManagement, AdminDashboard)
│   │   ├── auth/               # Authentication (AuthForm)
│   │   ├── dashboard/          # User dashboard (MyReviews)
│   │   ├── employers/          # Employer components (EmployerCard, Search, etc.)
│   │   ├── layout/             # Layout components (Header, Footer, AuthNavigation)
│   │   ├── reviews/            # Review components (ReviewCard, RatingStars, etc.)
│   │   └── ui/                 # Shadcn UI primitives (button, card, dialog, etc.)
│   ├── lib/
│   │   ├── supabase/           # Supabase client utilities
│   │   │   ├── client.ts       # Browser client (use in client components)
│   │   │   ├── server.ts       # Server client (use in server components)
│   │   │   └── middleware.ts   # Auth session refresh
│   │   ├── blog-data.ts        # Blog post content
│   │   ├── ai-review.ts        # AI compliance review via Claude
│   │   ├── auth.ts             # Auth utilities (getCurrentUser, isUserAdmin, requireAdmin)
│   │   ├── constants.ts        # Shared constants (blog categories, date formatting)
│   │   ├── mock-data.ts        # Mock data for development
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # Utility functions (cn for classnames)
│   ├── scripts/                # Database utility scripts
│   └── middleware.ts           # Next.js middleware (auth session)
├── public/                     # Static assets
│   └── images/blog/            # Blog post images
├── schema.sql                  # Database schema
├── rls_policies.sql            # Row Level Security policies
├── migration_add_votes.sql     # Vote migration
├── migration_blog_posts.sql    # Blog posts table
├── migration_patient_load_cattiness.sql  # Patient load & cattiness columns
└── migration_review_moderation.sql       # Review moderation system
```

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Key Conventions

### Import Aliases

Use the `@/*` path alias for imports:
```typescript
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';
```

### Component Patterns

**Server Components (default)**
- Pages in `/src/app` are server components by default
- Use `async function` for data fetching
- Import server Supabase client: `import { createClient } from '@/lib/supabase/server'`

```typescript
// Server component example
export default async function EmployersPage() {
    const supabase = await createClient();
    const { data: employers } = await supabase.from('employers').select('*');
    return <div>{/* render */}</div>;
}
```

**Client Components**
- Add `'use client'` directive at top of file
- Use browser Supabase client: `import { createClient } from '@/lib/supabase/client'`
- Required for interactivity, hooks, event handlers

### Dynamic Route Params (Next.js 16)

Dynamic route parameters are now async Promises:
```typescript
interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function Page(props: PageProps) {
    const params = await props.params;
    const id = params.id;
}
```

### Styling

- Use Tailwind CSS utility classes
- Use `cn()` utility for conditional classnames
- Shadcn components use CSS variables defined in `globals.css`

```typescript
import { cn } from '@/lib/utils';

<div className={cn("base-class", condition && "conditional-class")} />
```

### UI Components

Shadcn UI components are in `src/components/ui/`. Add new components via:
```bash
npx shadcn@latest add [component-name]
```

Available components: avatar, badge, button, card, dialog, dropdown-menu, input, label, progress, select, separator, sheet, tabs, textarea

### Icons

Use Lucide React icons:
```typescript
import { Star, MapPin, Building2 } from 'lucide-react';
```

## Database Schema

### Core Tables

| Table | Description |
|-------|-------------|
| `users` | User profiles (extends Supabase auth.users) |
| `employers` | Healthcare facilities (hospitals, clinics, etc.) |
| `reviews` | Workplace reviews with ratings |
| `salaries` | Salary reports by position |
| `interviews` | Interview experience reports |
| `review_votes` | Helpfulness voting on reviews |

### Key Types

```typescript
// Employer types
type employer_type = 'hospital' | 'clinic' | 'urgent_care' | 'nursing_home';
type teaching_status = 'academic' | 'community' | 'specialty';

// Review statuses
type review_status = 'pending' | 'approved' | 'rejected' | 'revision_requested';
type verification_status = 'unverified' | 'verified';
type work_timeframe = 'currently' | 'within_6_months' | '6_12_months' | 'over_1_year';
```

### Review Ratings

Reviews include 8 rating categories (1-5 scale):
- `rating_overall`
- `rating_staffing`
- `rating_safety`
- `rating_culture`
- `rating_management`
- `rating_pay_benefits`
- `rating_cattiness` (optional, uses Cat icons)
- `patient_load` (text, e.g. "1-4", "5-8", "20+")

## Authentication

Supabase Auth with email/password and OAuth providers (Google, GitHub).

**Auth Flow:**
1. User signs in via `/login`
2. OAuth redirects to `/auth/callback`
3. Middleware (`src/middleware.ts`) refreshes sessions on each request
4. Server components check auth: `const { data: { user } } = await supabase.auth.getUser()`

**Protected Routes:**
- `/dashboard` - User's reviews and profile
- `/admin` - Admin dashboard (requires `is_admin` flag)
- `/reviews/submit` - Review submission

## Environment Variables

Required environment variables (create `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=your_anthropic_api_key  # For AI compliance review
```

## Row Level Security (RLS)

Database uses RLS policies:
- **Employers**: Public read access
- **Reviews**: Public read for approved, users can read/insert/update/delete own
- **Salaries/Interviews**: Public read, authenticated users can insert
- **Users**: Public read profiles, users can update own

## Common Patterns

### Fetching Data in Server Components

```typescript
const supabase = await createClient();

// Single item
const { data: employer } = await supabase
    .from('employers')
    .select('*')
    .eq('id', id)
    .single();

// List with filter
const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('employer_id', employerId)
    .eq('status', 'approved');
```

### Checking Admin Status

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

let isAdmin = false;
if (user) {
    const { data: profile } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    isAdmin = profile?.is_admin || false;
}
```

### Using notFound()

```typescript
import { notFound } from 'next/navigation';

if (!employer) {
    notFound();
}
```

## Review Moderation System

Reviews go through a moderation workflow before being published:

**Statuses:** `pending` → `approved` | `rejected` | `revision_requested`

**Flow:**
1. User submits review → status: `pending`
2. AI compliance review runs automatically on submission (checks for defamation, HIPAA violations, platform liability)
3. Admin sees review in queue with AI recommendation pre-attached
4. Admin can: Approve, Reject (with comment), or Request Revision (with comment)
5. If revision requested → user sees feedback + AI suggestions on their dashboard
6. User can: Accept AI suggestions, Edit & resubmit, or Delete the review
7. Resubmitted reviews go back to `pending` with fresh AI review

**Review moderation columns:** `admin_comment`, `ai_review_result` (jsonb), `updated_at`

### API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/reviews/submit` | POST | User | Submit review + auto AI review |
| `/api/reviews/[id]/moderate` | PUT | Admin | Approve/reject/request revision |
| `/api/reviews/[id]/ai-review` | POST | Admin | Manually trigger AI review |
| `/api/reviews/[id]/revise` | PUT | User | Resubmit revised review |
| `/api/reviews/[id]` | DELETE | User | Delete own review |
| `/api/blog` | GET/POST/PUT | Public/Admin | Blog CRUD |
| `/api/blog/seed` | POST | Admin | Import static blog posts |

## Testing and Debugging

### Mock Data

Development can use mock data from `src/lib/mock-data.ts` when database is unavailable. The employer detail page (`/employers/[id]`) currently uses mock data.

### Database Scripts

```bash
# Located in src/scripts/
npx tsx src/scripts/check-db.ts    # Check database connection
npx tsx src/scripts/seed.ts        # Seed test data
npx tsx src/scripts/make-admin.ts  # Make user admin
npx tsx src/scripts/test-rls.ts    # Test RLS policies
```

## Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Next.js Core Web Vitals + TypeScript rules
- **Formatting**: Standard TypeScript/React conventions
- **Components**: Functional components with TypeScript interfaces for props
- **Naming**: PascalCase for components, camelCase for functions/variables

## File Naming

- Components: `PascalCase.tsx` (e.g., `ReviewCard.tsx`)
- Pages: `page.tsx` (Next.js convention)
- Utilities: `kebab-case.ts` (e.g., `blog-data.ts`)
- Types: Defined in `types.ts` or co-located

## Adding New Features

1. **New Page**: Create `src/app/[route]/page.tsx`
2. **New Component**: Add to appropriate `src/components/[category]/`
3. **New UI Primitive**: Use `npx shadcn@latest add [component]`
4. **New Database Table**: Update `schema.sql` and `src/lib/types.ts`
5. **New API Route**: Create `src/app/api/[route]/route.ts`

## Known Issues / TODOs

- Employer detail page uses mock data instead of database
- Search functionality UI exists but not fully implemented
- Filter functionality on employers page is placeholder
- `/account` page fails during `next build` prerender (needs Supabase env vars at build time)
