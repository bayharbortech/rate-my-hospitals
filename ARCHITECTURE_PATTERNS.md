# Architecture Patterns for Next.js Full-Stack Applications

A practical guide to four architectural improvements for Next.js App Router projects backed by Supabase (or any backend-as-a-service). Each pattern is explained generically so it can be applied to any project, then illustrated with concrete examples from this codebase.

---

## Table of Contents

1. [Data Access Layer (Repository Pattern)](#1-data-access-layer-repository-pattern)
2. [Server Actions over API Routes](#2-server-actions-over-api-routes)
3. [Feature-Based Folder Structure](#3-feature-based-folder-structure)
4. [Lightweight State Management](#4-lightweight-state-management)
5. [Priority and Decision Framework](#5-priority-and-decision-framework)

---

## 1. Data Access Layer (Repository Pattern)

### What It Is

The Repository Pattern places a thin abstraction between your application code and your data source. Instead of calling your database client directly from components, pages, and API routes, you call functions in a dedicated **data layer** that encapsulates all queries.

```
Component  -->  Data Layer  -->  Database Client  -->  Database
                (functions)      (Supabase SDK)       (PostgreSQL)
```

The data layer exposes functions like `getReviewsByEmployerId(id)` or `createReview(data)`. The rest of your application never sees the database client, the table names, or the query syntax.

### Why It Matters

**For any project:**

- **Single source of truth.** Every query for "approved reviews" lives in one function. If the business rule changes (e.g., add a date filter), you change it in one place instead of hunting through 10 files.
- **Testability.** You can mock the data layer in tests without mocking the database client. Testing `getReviewsByEmployerId` is simpler than testing a component that constructs a Supabase query inline.
- **Swappability.** If you migrate from Supabase to Prisma, from PostgreSQL to a REST API, or from one BaaS to another, the blast radius is limited to the data layer files.
- **Security boundary.** Centralizing data access makes it easier to audit what data is exposed and enforce authorization consistently.
- **Caching.** You can add `unstable_cache`, Redis, or in-memory caching in the data layer without touching any component code.

**Signals that you need this:**

- The same table is queried from 3+ different files
- You copy-paste `.from('table').select('*').eq(...)` across components
- Changing a query requires a search-and-replace across the codebase
- You have no idea which files touch a given table

### Current State in This App

A partial data layer exists in `src/lib/data/` with 5 files and 17 exported functions:

| File | Functions | Used By |
|------|-----------|---------|
| `employers.ts` | `getEmployers`, `getEmployerById`, `getEmployersByIds`, `getEmployerStates`, `getEmployerHealthSystems`, `searchEmployers`, `getFeaturedEmployers` | Server pages, search |
| `reviews.ts` | `getApprovedReviews`, `getReviewsByEmployerId`, `getRecentReviews`, `getFeaturedReview`, `getReviewDepartments` | Server pages, homepage |
| `salaries.ts` | `getSalaries`, `getSalariesByEmployerId`, `getSalaryDepartments` | Server pages |
| `interviews.ts` | `getInterviews`, `getInterviewsByEmployerId` | Server pages |
| `trending.ts` | `getTrendingHospitals` | Homepage |

However, **16 client components bypass the data layer entirely** and call Supabase directly:

| Component | Direct Supabase Calls | Purpose |
|-----------|----------------------|---------|
| `QASection.tsx` | 7 queries (questions, answers, votes) | Q&A feature |
| `EmployerActions.tsx` | 3 queries (follows) | Follow/unfollow |
| `HelpfulnessVoting.tsx` | 3 queries (votes) | Review voting |
| `DashboardPageClient.tsx` | 2 queries (reviews, saved) | User dashboard |
| `SaveReviewButton.tsx` | 1 query | Save/unsave |
| `AddEmployerDialog.tsx` | 1 query (insert) | Add employer |
| `BlogManagement.tsx` | 1 query (delete) | Admin blog |
| `UserManagement.tsx` | 1 query (update) | Admin users |
| `AuthForm.tsx` | auth calls | Login/signup |
| `AuthNavigation.tsx` | auth calls | Session check |
| `ProfileSection.tsx` | 1 query (update) | Profile edit |
| `PasswordSection.tsx` | auth calls | Password change |
| `DangerZoneSection.tsx` | 1 query (delete) | Account deletion |
| `forgot-password/page.tsx` | auth calls | Password reset |
| `reset-password/page.tsx` | auth calls | Password reset |
| `account/page.tsx` | 1 query | Account page |

Additionally, **9 API routes** construct their own Supabase queries instead of using the data layer.

### Before (Direct Supabase call in a component)

From `QASection.tsx` -- the component builds queries inline, mixes data fetching with UI state, and has to handle errors at the call site:

```typescript
// Inside the component function body
const { data: questionsData, error: questionsError } = await supabase
    .from('questions')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

if (questionsError) {
    setErrorMessage(`Failed to load questions: ${questionsError.message}`);
    setLoading(false);
    return;
}

const questionIds = questionsData?.map(q => q.id) || [];
let answersData: Answer[] = [];

if (questionIds.length > 0) {
    const { data, error: answersError } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds)
        .order('upvotes', { ascending: false });
    // ... more error handling
}
```

### After (Data layer function)

Create `src/lib/data/questions.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';

export interface Question {
    id: string;
    employer_id: string;
    user_id: string | null;
    question_text: string;
    created_at: string;
    upvotes: number;
    is_answered: boolean;
    answers: Answer[];
}

export interface Answer {
    id: string;
    question_id: string;
    user_id: string | null;
    answer_text: string;
    created_at: string;
    upvotes: number;
    is_accepted: boolean;
}

export async function getQuestionsByEmployerId(employerId: string): Promise<Question[]> {
    const supabase = await createClient();

    const { data: questions, error } = await supabase
        .from('questions')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false });

    if (error) throw new Error(`Failed to load questions: ${error.message}`);

    const questionIds = questions.map(q => q.id);
    if (questionIds.length === 0) return questions.map(q => ({ ...q, answers: [] }));

    const { data: answers } = await supabase
        .from('answers')
        .select('*')
        .in('question_id', questionIds)
        .order('upvotes', { ascending: false });

    return questions.map(q => ({
        ...q,
        answers: (answers || []).filter(a => a.question_id === q.id),
    }));
}
```

The component then becomes:

```typescript
// Clean, declarative data fetching
const questions = await getQuestionsByEmployerId(employerId);
```

### Implementation Plan

**Phase 1: Create missing data modules**

| New File | Covers |
|----------|--------|
| `src/lib/data/questions.ts` | `getQuestionsByEmployerId`, `createQuestion`, `createAnswer`, `voteQuestion`, `voteAnswer` |
| `src/lib/data/settings.ts` | `getAllSettings`, `updateSetting`, `getAppSetting` (move from `api/settings/route.ts`) |
| `src/lib/data/users.ts` | `getUserProfile`, `updateUserProfile`, `toggleAdminStatus`, `deleteUser` |

**Phase 2: Create API routes for client-side mutations**

Client components cannot call server-only data layer functions directly. For mutations triggered from client components (voting, following, submitting), create thin API routes that delegate to the data layer:

```
Client Component  -->  fetch('/api/...')  -->  API Route  -->  Data Layer  -->  Supabase
```

**Phase 3: Migrate existing client components**

Work through the 16 client components one at a time. For each:
1. Identify which Supabase calls are reads vs writes
2. Move reads to the data layer (called from server components or API routes)
3. Move writes to API routes that call the data layer
4. Remove `createClient` import from the component

**Exceptions -- auth calls can stay direct.** Components like `AuthForm.tsx`, `PasswordSection.tsx`, and `AuthNavigation.tsx` use `supabase.auth.*` methods. These are client-side by design (they manage browser sessions/tokens) and should remain direct.

---

## 2. Server Actions over API Routes

### What It Is

Server Actions are functions that run on the server but can be called directly from client components without writing an API route. They were stabilized in Next.js 14 and are the recommended approach for mutations in the App Router.

Instead of:
```
Client Component  -->  fetch('/api/reviews/123/moderate')  -->  route.ts  -->  Database
```

You get:
```
Client Component  -->  moderateReview(id, status)  -->  Database
```

A Server Action is a regular `async` function marked with `'use server'`. It can be imported into client components and called like any async function. Next.js handles the network request, serialization, and error boundaries automatically.

### Why It Matters

**For any project:**

- **Less boilerplate.** No `route.ts` file, no `fetch()` call, no manual JSON parsing, no manual `Content-Type` header, no manual error response handling.
- **Type safety end-to-end.** The function signature is shared between client and server. If you change the parameters, TypeScript catches mismatches at build time -- not at runtime with a 400 error.
- **Automatic revalidation.** Server Actions integrate with `revalidatePath()` and `revalidateTag()` to refresh server-rendered data after a mutation, replacing manual `router.refresh()`.
- **Progressive enhancement.** Forms using Server Actions work without JavaScript enabled (the form submits as a standard POST).
- **Smaller bundle.** Server Action code is never sent to the browser. API route handler code is also server-only, but the `fetch()` call and error handling in the client component is not.

**When to keep API routes:**

- **GET endpoints consumed by client-side filtering/pagination** (e.g., `fetch('/api/top40?state=CA')`) -- Server Actions are designed for mutations, not repeated data fetching with changing parameters.
- **Endpoints consumed by external clients** (mobile apps, third-party integrations, webhooks).
- **Streaming responses** or Server-Sent Events.

### Current State in This App

| API Route | Method | Action Type | Recommendation |
|-----------|--------|-------------|----------------|
| `reviews/submit/route.ts` | POST | Mutation (create review) | Convert to Server Action |
| `reviews/[id]/moderate/route.ts` | PUT | Mutation (update status) | Convert to Server Action |
| `reviews/[id]/ai-review/route.ts` | POST | Mutation (trigger AI) | Convert to Server Action |
| `reviews/[id]/revise/route.ts` | PUT | Mutation (resubmit) | Convert to Server Action |
| `reviews/[id]/route.ts` | DELETE | Mutation (delete review) | Convert to Server Action |
| `settings/route.ts` | GET, PUT | Read + Mutation | Convert PUT to Server Action; keep GET or move to data layer |
| `blog/route.ts` | GET, POST, PUT | Read + Mutations | Convert POST/PUT to Server Actions; keep GET |
| `blog/seed/route.ts` | POST | Mutation (seed data) | Convert to Server Action |
| `top40/route.ts` | GET | Read with filters | Keep as API Route |

**7 of 9 routes** are pure mutations that would be simpler as Server Actions.

### Before (API Route + fetch)

**`src/app/api/reviews/[id]/moderate/route.ts`** (62 lines):

```typescript
import { requireAdmin } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const admin = await requireAdmin();
    if (!admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { id } = await params;

    let body: ModerateRequest;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // ... validation ...

    const { data, error } = await admin.supabase
        .from('reviews')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}
```

**Client-side call in `AdminDashboard.tsx`** (15 lines of fetch boilerplate):

```typescript
const res = await fetch(`/api/reviews/${reviewId}/moderate`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        status,
        admin_comment: actionComment.trim() || undefined,
    }),
});

if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to moderate review');
}
```

### After (Server Action)

**`src/lib/actions/reviews.ts`** (~30 lines):

```typescript
'use server'

import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function moderateReview(
    reviewId: string,
    status: 'approved' | 'rejected' | 'revision_requested',
    adminComment?: string
) {
    const admin = await requireAdmin();
    if (!admin) throw new Error('Forbidden');

    if ((status === 'rejected' || status === 'revision_requested') && !adminComment) {
        throw new Error('A comment is required when rejecting or requesting revision');
    }

    const { error } = await admin.supabase
        .from('reviews')
        .update({
            status,
            admin_comment: adminComment,
            updated_at: new Date().toISOString(),
        })
        .eq('id', reviewId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
}
```

**Client-side call** (1 line):

```typescript
import { moderateReview } from '@/lib/actions/reviews';

// Inside the component:
await moderateReview(reviewId, status, actionComment.trim());
```

The `route.ts` file is deleted entirely. The client component no longer needs `fetch`, `JSON.stringify`, response parsing, or `router.refresh()`.

### Implementation Plan

**Step 1:** Create `src/lib/actions/` directory with:
- `reviews.ts` -- `moderateReview`, `submitReview`, `deleteReview`, `reviseReview`, `triggerAIReview`
- `settings.ts` -- `updateSetting`
- `blog.ts` -- `createBlogPost`, `updateBlogPost`, `seedBlogPosts`

**Step 2:** Migrate one route at a time:
1. Create the Server Action
2. Update the client component to import and call the action
3. Remove the old `fetch()` call
4. Delete the `route.ts` file
5. Test the flow

**Step 3:** Keep `top40/route.ts` as an API route (GET with query params for client-side filtering). Optionally keep `blog GET` as an API route if consumed by client-side pagination.

---

## 3. Feature-Based Folder Structure

### What It Is

Feature-based organization groups files by **what they do** rather than **what they are**. Instead of putting all components in `components/`, all API routes in `app/api/`, and all types in `lib/types.ts`, you colocate related files:

```
Type-based (current):                Feature-based (proposed):
src/                                 src/
  components/                          features/
    admin/                               reviews/
    reviews/                               components/
    employers/                             actions/
  app/                                     data/
    api/                                   types.ts
      reviews/                           employers/
    reviews/                               components/
  lib/                                     data/
    data/                                  types.ts
      reviews.ts                         admin/
    types.ts                               ...
```

### Why It Matters

**For any project:**

- **Locality of reference.** When working on "reviews," everything you need is in one folder. You don't context-switch between `components/reviews/`, `app/api/reviews/`, `lib/data/reviews.ts`, and `lib/types.ts`.
- **Clear ownership.** Each feature folder is a self-contained module. It is obvious who owns what and what the boundaries are.
- **Easier deletion.** Removing a feature means deleting one folder, not hunting across 5 directories.
- **Better code splitting.** Feature boundaries naturally align with dynamic import boundaries.
- **Scales with team size.** Two developers can work on `features/reviews/` and `features/employers/` without merge conflicts in shared directories.

**When type-based is fine:**

- Projects under ~50 files where everything fits in your head
- Projects with one developer where the mental model is clear
- Libraries (not apps) where the "feature" is the library itself

**When feature-based pays off:**

- Projects over ~80-100 files (this project has 143)
- Multiple developers or teams
- Features that are added, removed, or significantly changed over time

### Current State in This App

The "reviews" feature is spread across **5 directories** and **20+ files**:

```
src/app/api/reviews/submit/route.ts         # Submit API
src/app/api/reviews/[id]/route.ts           # Delete API
src/app/api/reviews/[id]/moderate/route.ts  # Moderate API
src/app/api/reviews/[id]/ai-review/route.ts # AI review API
src/app/api/reviews/[id]/revise/route.ts    # Revise API
src/app/reviews/page.tsx                    # Reviews list page
src/app/reviews/ReviewsPageClient.tsx       # Client component
src/app/reviews/submit/page.tsx             # Submit page
src/components/reviews/SubmitReviewForm.tsx  # Submit form
src/components/reviews/ReviewCard.tsx        # Card component
src/components/reviews/ReviewsList.tsx       # List component
src/components/reviews/RatingStars.tsx       # Stars component
src/components/reviews/RatingBreakdown.tsx   # Breakdown
src/components/reviews/RatingsSection.tsx    # Ratings section
src/components/reviews/SalarySection.tsx     # Salary section
src/components/reviews/InterviewSection.tsx  # Interview section
src/components/reviews/HelpfulnessVoting.tsx # Voting
src/components/reviews/SaveReviewButton.tsx  # Save button
src/lib/data/reviews.ts                     # Data layer
src/lib/ai-review.ts                        # AI logic
src/lib/types.ts                            # (shared) Types
```

### Proposed Structure

```
src/
  features/
    reviews/
      components/
        ReviewCard.tsx
        ReviewsList.tsx
        RatingStars.tsx
        RatingBreakdown.tsx
        RatingsSection.tsx
        SalarySection.tsx
        InterviewSection.tsx
        HelpfulnessVoting.tsx
        SaveReviewButton.tsx
        SubmitReviewForm.tsx
      actions/
        submit.ts
        moderate.ts
        revise.ts
        ai-review.ts
        delete.ts
      data/
        queries.ts          # getApprovedReviews, getReviewsByEmployerId, etc.
      types.ts              # Review, AIReviewResult, etc.
      ai-review.ts          # AI integration logic

    employers/
      components/
        EmployerCard.tsx
        EmployerSearch.tsx
        EmployerTabs.tsx
        EmployerActions.tsx
        AddEmployerDialog.tsx
        QASection.tsx
        DepartmentReviews.tsx
        InterviewSection.tsx
        InterviewList.tsx
        SalaryList.tsx
        HospitalBadges.tsx
      data/
        queries.ts
      types.ts

    admin/
      components/
        AdminDashboard.tsx
        ModerationReviewCard.tsx
        ModerationSettings.tsx
        AIResultPanel.tsx
        RiskBadge.tsx
        BlogManagement.tsx
        BlogPostEditor.tsx
        UserManagement.tsx
      actions/
        moderate.ts
        settings.ts
        blog.ts
      types.ts

    auth/
      components/
        AuthForm.tsx
        AuthNavigation.tsx
      actions/
        login.ts
        signup.ts
        reset-password.ts

    dashboard/
      components/
        MyReviews.tsx
        UserReviewCard.tsx
        Top40Dashboard.tsx

    account/
      components/
        ProfileSection.tsx
        PasswordSection.tsx
        DangerZoneSection.tsx
        NotificationsSection.tsx

  shared/                   # Truly shared utilities
    components/
      ui/                   # Shadcn primitives (button, card, etc.)
      layout/               # Header, Footer
      home/                 # Homepage sections
    lib/
      constants.ts
      utils.ts
      supabase/
        client.ts
        server.ts
        middleware.ts

  app/                      # Next.js route definitions (thin wrappers)
    page.tsx
    layout.tsx
    admin/page.tsx
    employers/[id]/page.tsx
    reviews/page.tsx
    ...
```

### Implementation Plan

**Important: this is a large refactor.** Do it incrementally, one feature at a time.

**Step 1:** Create `src/features/` directory and start with the smallest feature (e.g., `account`).

**Step 2:** Move files, update imports, verify build. Use the `@/` path alias -- this means all imports like `@/components/account/ProfileSection` become `@/features/account/components/ProfileSection`.

**Step 3:** Repeat for each feature in order of isolation (least cross-feature dependencies first):
1. `account` (4 components, no data layer)
2. `auth` (2 components)
3. `admin` (8 components, actions, types)
4. `dashboard` (3 components)
5. `employers` (11 components, data, types)
6. `reviews` (10 components, actions, data, types)

**Step 4:** Move shared code to `src/shared/` and update `tsconfig.json` paths if needed.

**Step 5:** Update `CLAUDE.md` project structure documentation.

**Tradeoff:** Feature-based structure adds a small overhead for truly shared types and utilities. Keep a `src/shared/` folder for cross-cutting concerns. If a type is used by 3+ features, it belongs in `shared/`.

---

## 4. Lightweight State Management

### What It Is

State management is about choosing the right tool for the right scope of state:

| Scope | Tool | Example |
|-------|------|---------|
| **Local** (one component) | `useState` | Form input value, dropdown open/closed |
| **Shared** (parent + children) | Props, Context, or custom hook | Review form state shared across RatingsSection, SalarySection |
| **Feature-wide** (sibling components) | Zustand store or Context | Admin moderation queue (list, expanded item, filters, actions) |
| **Global** (entire app) | Zustand, Jotai, or Context | Auth state, theme, feature flags |

The key insight: **not all state needs to be managed the same way.** The problem is not `useState` itself -- it is using `useState` for state that has outgrown local scope.

### Why It Matters

**For any project:**

- **Reduces prop drilling.** When a parent has 10 `useState` calls and passes pieces down as 10+ props, it becomes hard to trace which prop controls what. Extracting shared state eliminates this threading.
- **Colocation of logic.** Business rules like "you can't approve a review without an AI review" live in the store/hook, not scattered across event handlers in multiple components.
- **Predictable updates.** A Zustand store or custom hook gives you a single place to see all state transitions, making bugs easier to find.
- **Better performance.** Context and Zustand allow components to subscribe to only the state slices they need, avoiding unnecessary re-renders from unrelated state changes.

**When NOT to add state management:**

- If state is truly local to one component, `useState` is perfect. Do not over-engineer.
- If you have fewer than 3 consumers of the same state, props are fine.
- If the state is server-derived and read-only, use server components or SWR/React Query instead.
- Adding Zustand to a 5-component app is premature optimization.

### Current State in This App

**High `useState` counts (components managing too much local state):**

| File | `useState` Calls | Problem |
|------|-----------------|---------|
| `SubmitReviewForm.tsx` | 15+ | Form with ratings, text, employer, salary, interview all as individual state variables |
| `QASection.tsx` | 11 | Questions, answers, votes, forms, user, loading -- all tangled together |
| `SearchPageClient.tsx` | 9 | Filters, pagination, sort |
| `BlogPostEditor.tsx` | 9 | Form fields for blog post |
| `BlogManagement.tsx` | 9 | List state, view mode, editing, deletion |
| `reset-password/page.tsx` | 8 | Form fields and UI state |
| `EmployersPageClient.tsx` | 7 | Filters, sort, display options |
| `PasswordSection.tsx` | 7 | Form fields and visibility toggles |

**Prop drilling (too many props passed to children):**

| Component | Props | Purpose |
|-----------|-------|---------|
| `ModerationReviewCard` | 10 props | Review, AI result, expanded state, loading states, comment, 4 callbacks |
| `InterviewSection` (reviews) | 8 props | Form state for interview questions |
| `RatingsSection` | 6 props | Rating values and change handlers |
| `SalarySection` | 6 props | Salary form state |
| `EmployerTabs` | 6 props | Tab data (reviews, salaries, interviews) |

### Solution A: Custom Hooks for Form State

Extract related `useState` calls into a custom hook that encapsulates the state and its business logic.

**Before** (`SubmitReviewForm.tsx` -- 15+ useState calls):

```typescript
export function SubmitReviewForm({ employers, userId }: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [employers, setEmployers] = useState(initialEmployers);
    const [employerId, setEmployerId] = useState('');
    const [employerOpen, setEmployerOpen] = useState(false);
    const [selectedState, setSelectedState] = useState('');
    const [ratings, setRatings] = useState({ staffing: 0, safety: 0, ... });
    const [patientLoad, setPatientLoad] = useState('');
    const [cattiness, setCattiness] = useState(0);
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [positionType, setPositionType] = useState('');
    const [department, setDepartment] = useState('');
    const [showSalary, setShowSalary] = useState(false);
    // ... 5 more for salary and interview fields
```

**After** (custom hook):

```typescript
// src/features/reviews/hooks/useReviewForm.ts
export function useReviewForm(initialEmployers: Employer[]) {
    // Employer selection
    const [employers, setEmployers] = useState(initialEmployers);
    const [employerId, setEmployerId] = useState('');
    const [selectedState, setSelectedState] = useState('');

    // Review content
    const [title, setTitle] = useState('');
    const [reviewText, setReviewText] = useState('');
    const [ratings, setRatings] = useState({ staffing: 0, safety: 0, ... });

    // Submission state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const filteredEmployers = selectedState
        ? employers.filter(e => e.state === selectedState)
        : employers;

    const handleSubmit = async () => { /* ... */ };
    const reset = () => { /* ... */ };

    return {
        // Expose only what the form components need
        employers: filteredEmployers,
        employerId, setEmployerId,
        selectedState, setSelectedState,
        title, setTitle,
        reviewText, setReviewText,
        ratings, setRatings,
        loading, error, submitted,
        handleSubmit, reset,
    };
}
```

The component becomes a thin UI shell:

```typescript
export function SubmitReviewForm({ employers, userId }: Props) {
    const form = useReviewForm(employers);

    if (form.submitted) return <SuccessMessage />;

    return (
        <form onSubmit={form.handleSubmit}>
            <EmployerPicker
                employers={form.employers}
                value={form.employerId}
                onChange={form.setEmployerId}
            />
            <RatingsSection ratings={form.ratings} onChange={form.setRatings} />
            {/* ... */}
        </form>
    );
}
```

### Solution B: Zustand Store for Feature-Wide State

When multiple sibling components need access to the same state (like the admin moderation queue), a Zustand store eliminates prop drilling.

**Before** (`AdminDashboard.tsx` manages all state, passes 10 props to each `ModerationReviewCard`):

```typescript
export function AdminDashboard({ reviews: initialReviews }: Props) {
    const [reviews, setReviews] = useState(initialReviews);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [actionComment, setActionComment] = useState(DEFAULT_COMMENT);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [aiResults, setAiResults] = useState<Record<string, AIReviewResult>>({});
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Each card receives 10 props:
    <ModerationReviewCard
        review={review}
        aiResult={aiResult}
        isExpanded={expandedId === review.id}
        isLoading={actionLoading === review.id}
        isAiLoading={aiLoading === review.id}
        actionComment={actionComment}
        onToggleExpand={() => toggleExpand(review.id)}
        onModerate={(status) => handleModerate(review.id, status)}
        onAIReview={() => handleAIReview(review.id)}
        onCommentChange={setActionComment}
    />
```

**After** (Zustand store):

```typescript
// src/features/admin/stores/useModerationStore.ts
import { create } from 'zustand';
import { AIReviewResult } from '@/lib/types';

interface ModerationState {
    reviews: ReviewWithEmployer[];
    expandedId: string | null;
    actionComment: string;
    actionLoading: string | null;
    aiLoading: string | null;
    aiResults: Record<string, AIReviewResult>;
    errorMessage: string | null;

    // Actions
    toggleExpand: (id: string) => void;
    moderate: (reviewId: string, status: string) => Promise<void>;
    runAIReview: (reviewId: string) => Promise<void>;
    setComment: (comment: string) => void;
}

export const useModerationStore = create<ModerationState>((set, get) => ({
    reviews: [],
    expandedId: null,
    actionComment: 'Please review for editorial revision',
    actionLoading: null,
    aiLoading: null,
    aiResults: {},
    errorMessage: null,

    toggleExpand: (id) => set(state => ({
        expandedId: state.expandedId === id ? null : id,
        actionComment: 'Please review for editorial revision',
    })),

    moderate: async (reviewId, status) => {
        // All mutation logic lives here, not in the component
        set({ actionLoading: reviewId, errorMessage: null });
        try {
            await moderateReview(reviewId, status, get().actionComment);
            set(state => ({
                reviews: state.reviews.filter(r => r.id !== reviewId),
                expandedId: null,
                actionComment: 'Please review for editorial revision',
            }));
        } catch (err) {
            set({ errorMessage: err instanceof Error ? err.message : 'Failed' });
        } finally {
            set({ actionLoading: null });
        }
    },

    // ... other actions
}));
```

The card component now reads from the store directly -- **zero props needed for state**:

```typescript
export function ModerationReviewCard({ review }: { review: ReviewWithEmployer }) {
    const {
        expandedId, actionComment, actionLoading, aiLoading,
        aiResults, toggleExpand, moderate, runAIReview, setComment,
    } = useModerationStore();

    const isExpanded = expandedId === review.id;
    const aiResult = aiResults[review.id] || review.ai_review_result;

    // ... render using store state
}
```

### Choosing Between Options

| Situation | Use |
|-----------|-----|
| Form with many fields in one component | Custom hook (`useReviewForm`) |
| Parent passes 5+ props to children | Custom hook or Context |
| Siblings need the same state | Zustand store |
| App-wide state (auth, theme) | Zustand or Context |
| Server-derived data that changes rarely | Server components + `revalidatePath` |
| Server-derived data with client-side filtering | React Query / SWR (or keep `useState` + `fetch`) |

### Implementation Plan

**Step 1:** Install Zustand (`npm install zustand`). No other dependencies needed.

**Step 2:** Start with custom hooks (lowest risk):
- Extract `useReviewForm` from `SubmitReviewForm.tsx`
- Extract `useSearchFilters` from `SearchPageClient.tsx`
- Extract `useQA` from `QASection.tsx`

**Step 3:** Add Zustand stores where siblings share state:
- `useModerationStore` for the admin review queue
- `useBlogEditorStore` for blog management (list view + editor share state)

**Step 4:** Evaluate whether app-wide auth state (currently fetched independently in 6+ components) should move to a global store or Context.

---

## 5. Priority and Decision Framework

### Recommended Order of Adoption

| Priority | Pattern | Effort | Impact | Risk |
|----------|---------|--------|--------|------|
| 1 | Server Actions | Low | High | Low -- drop-in replacement for API routes, one at a time |
| 2 | Data Access Layer | Medium | High | Low -- additive, does not break existing code |
| 3 | Feature Folders | Medium | Medium | Medium -- large file move, many import updates |
| 4 | State Management | Medium | Medium | Low -- additive, one component at a time |

Server Actions come first because they are the smallest change with the highest payoff: delete boilerplate, gain type safety, and align with where Next.js is heading. The Data Access Layer is next because it compounds -- every future feature benefits from centralized queries. Feature folders and state management are the longest-term investments that pay off as the codebase grows.

### Decision Checklist for Any Next.js Project

Use this checklist when evaluating whether a project would benefit from these patterns:

**Data Access Layer:**
- [ ] Do 3+ files query the same table?
- [ ] Have you copy-pasted a `.from('table').select(...)` call?
- [ ] Would changing a query require updating multiple files?
- [ ] Do you want to add caching later?

If you checked 2+, add a data access layer.

**Server Actions:**
- [ ] Do you have API routes that are simple create/update/delete operations?
- [ ] Do client components have boilerplate `fetch()` + `res.json()` + error handling?
- [ ] Are your API routes only called by your own frontend (not external clients)?
- [ ] Are you on Next.js 14+?

If you checked 3+, migrate to Server Actions.

**Feature-Based Folders:**
- [ ] Does your project have 80+ source files?
- [ ] Do you work across 3+ directories when changing one feature?
- [ ] Is the project worked on by 2+ developers?
- [ ] Do you plan to add or remove features regularly?

If you checked 2+, consider feature-based organization.

**State Management (beyond useState):**
- [ ] Does any component have 8+ `useState` calls?
- [ ] Do you pass 5+ props from parent to child?
- [ ] Do sibling components need access to the same state?
- [ ] Is the same data fetched independently in multiple components?

If you checked 2+, introduce custom hooks or a lightweight store.

---

*This document was generated as a reference guide for Rate My Hospitals and is designed to be applicable to any Next.js App Router project using a BaaS backend.*
