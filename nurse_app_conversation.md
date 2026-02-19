# Nurse Employment Experience App - Design & Planning Session

## Project Overview

Anonymous rating platform for nurses to review their workplace experiences in Southern California healthcare facilities.

**Tech Stack:** Next.js + Supabase + Vercel  
**Launch Strategy:** Southern California Regional Pilot  
**Verification:** Unverified reviews (initially) with future professional verification capability

---

## Design Phase - Completed ✅

### Core Concept
Provide a secure, anonymous platform for nurses to rate and review their workplace experiences, empowering them to share insights on staffing, safety, pay, culture, and management without fear of retaliation.

### Target Users & Personas

1. **Sarah, ICU Nurse** (Primary)
   - 3 years experience, considering job change
   - Wants honest insights on staffing ratios, overtime expectations
   - Values anonymity due to tight-knit healthcare community
   - *"As an ICU nurse, I want to share that my current hospital consistently runs unsafe patient ratios, so other nurses know what they're getting into."*

2. **Mike, Nurse Manager** (Secondary)
   - Wants to understand staff concerns to improve retention
   - Needs aggregate, non-identifying data to present to leadership
   - *"As a nurse manager, I want to see anonymous feedback trends to identify systemic issues affecting my team."*

3. **Jessica, New Grad** (Tertiary)
   - Recent nursing school graduate, evaluating first job offers
   - Needs reliable information beyond official hospital recruiting materials
   - *"As a new grad, I want to understand the real culture and support for new nurses before accepting a position."*

### Key Design Decisions

#### User Verification Strategy
- **Tiered Access System:**
  - **All Users:** Can browse reviews, search employers, bookmark facilities
  - **Registered Users:** Can submit ratings and reviews (all unverified initially)
  - **Future:** Professional verification through TBD method

#### Review Status System
- **🔘 Gray Checkmark - UNVERIFIED** (all reviews initially)
  - *"This review has not been professionally verified. Users should consider this when evaluating the content."*
- **Future verification badges:** Blue (professional), Green (institutional)

#### Content Moderation Approach
- **Moderate Philosophy:** AI-assisted human review with appeals process
- **Focus:** Legal compliance (libel/slander), appropriateness, guidelines adherence
- **Acceptance:** Some fake reviews may slip through; community voting helps identify quality

#### User Experience Features
- **Optional display names** for review consistency while maintaining anonymity
- **Work recency field** (optional): "Currently / Within 6 months / 6-12 months ago / More than 1 year ago"
- **Community voting:** Helpful/Not Helpful ratings for review quality assessment
- **Transparent moderation:** Yellow (pending), Green (approved), Red (rejected) status indicators

### MVP Features

#### Core Features
- Anonymous rating system (5 categories: staffing, safety, culture, management, pay/benefits)
- Employer directory & search (Southern California healthcare facilities)
- User authentication (email/OAuth) with legal disclaimers
- Transparent moderation with user status tracking
- Community helpfulness voting

#### Safety Features
- Identity protection (reviews permanently de-linked from user accounts)
- AI-assisted content moderation with human review
- Appeal process for rejected reviews
- Clear community guidelines and terms of service

### User Flows

#### Review Submission Flow
1. Simple Registration → Email/OAuth authentication → Legal disclaimers
2. Select "Add Review" → Search/Select Employer
3. Complete Rating Form (with optional work timeframe) → Optional text feedback
4. Content moderation check → Pending status (yellow checkmark)
5. AI analysis → Human moderator review → Approval/rejection
6. Final status update → Community voting enabled

#### Review Browsing Flow
1. Homepage → Search employers (location, name, type)
2. Select facility → View aggregate ratings + sample size
3. Filter/sort reviews (helpfulness, date, rating)
4. Read unverified reviews → Vote helpful/not helpful → Report if inappropriate

### Risk Assessment & Legal Protection

#### Primary Legal Concerns
- **Defamation/Libel:** Mitigated through human moderation focused on legal compliance
- **User Authenticity:** Accepted trade-off; rely on community voting for quality assessment
- **Platform Liability:** Protected through clear disclaimers and terms of service

#### Mitigation Strategies
- Conservative content moderation with appeals process
- Required legal disclaimers during registration
- Transparent "unverified" labeling on all reviews
- Quick takedown process for disputed content
- Community self-regulation through helpfulness voting

---

## Plan Phase - Completed ✅

### Technical Architecture

#### System Architecture
```
User Registration → Supabase Auth → User Dashboard
       ↓
Review Submission → Content Moderation Queue → AI Analysis
       ↓
Human Moderator Review → Approval/Rejection → Public Display
       ↓
Community Voting → Helpfulness Scores → Enhanced Discoverability
```

#### Technology Stack
- **Frontend:** Next.js 14 + ShadCN/UI + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- **Hosting:** Vercel (frontend + edge functions)
- **Integrations:** OpenAI Moderation API, Vercel Analytics

### Database Schema

#### Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    display_name TEXT, -- Optional anonymous display name
    auth_provider TEXT DEFAULT 'email',
    verification_status TEXT DEFAULT 'unverified',
    verification_date TIMESTAMP NULL,
    is_moderator BOOLEAN DEFAULT false,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employers Table (Healthcare Facilities)
CREATE TABLE employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'hospital', 'clinic', 'urgent_care', 'nursing_home'
    address TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'CA',
    zip_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    website TEXT,
    phone TEXT,
    bed_count INTEGER,
    health_system TEXT, -- Parent organization
    teaching_status TEXT, -- 'academic', 'community', 'specialty'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
    
    -- Rating Categories (1-5 scale)
    rating_overall INTEGER CHECK (rating_overall >= 1 AND rating_overall <= 5),
    rating_staffing INTEGER CHECK (rating_staffing >= 1 AND rating_staffing <= 5),
    rating_safety INTEGER CHECK (rating_safety >= 1 AND rating_safety <= 5),
    rating_culture INTEGER CHECK (rating_culture >= 1 AND rating_culture <= 5),
    rating_management INTEGER CHECK (rating_management >= 1 AND rating_management <= 5),
    rating_pay_benefits INTEGER CHECK (rating_pay_benefits >= 1 AND rating_pay_benefits <= 5),
    
    -- Review Content
    title TEXT,
    review_text TEXT,
    work_timeframe TEXT, -- 'currently', 'within_6_months', '6_12_months', 'over_1_year'
    department TEXT, -- 'ICU', 'ED', 'Med-Surg', etc.
    position_type TEXT, -- 'Staff Nurse', 'Charge Nurse', 'Travel Nurse', etc.
    
    -- Review Status
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    verification_level TEXT DEFAULT 'unverified',
    
    -- Moderation
    ai_risk_score INTEGER DEFAULT 0, -- 1-10 scale
    ai_recommendation TEXT, -- 'approve', 'review_carefully', 'reject'
    ai_reasoning TEXT, -- Detailed AI analysis
    moderator_notes TEXT,
    moderated_by UUID REFERENCES users(id),
    moderated_at TIMESTAMP,
    
    -- Community Engagement
    helpful_votes_up INTEGER DEFAULT 0,
    helpful_votes_down INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Review Votes Table (for helpfulness voting)
CREATE TABLE review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type TEXT NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(review_id, user_id) -- One vote per user per review
);

-- Moderation Queue Table
CREATE TABLE moderation_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
    assigned_to UUID REFERENCES users(id), -- NULL if unassigned
    status TEXT DEFAULT 'pending', -- 'pending', 'in_review', 'completed'
    created_at TIMESTAMP DEFAULT NOW(),
    assigned_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Appeals Table
CREATE TABLE appeals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    admin_response TEXT,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'denied'
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);
```

### Row-Level Security (RLS) & RBAC

#### Security Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR ALL USING (auth.uid() = id);

-- Reviews visibility: approved reviews public, users see own pending/rejected
CREATE POLICY "Public can view approved reviews" ON reviews
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Users can view own reviews" ON reviews
    FOR SELECT USING (auth.uid() = user_id);

-- Moderators can access moderation queue
CREATE POLICY "Moderators can access queue" ON moderation_queue
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND (users.is_moderator = true OR users.is_admin = true)
        )
    );
```

### API Endpoints

#### Public Endpoints
```typescript
GET /api/employers                    // Search/browse employers
GET /api/employers/[id]               // Individual employer details
GET /api/employers/[id]/reviews       // Approved reviews for employer
GET /api/employers/[id]/stats         // Aggregate rating statistics
GET /api/reviews                      // Browse approved reviews (with filters)
POST /api/reviews/[id]/vote          // Vote helpful/not helpful
GET /api/search?q=hospital+name      // Search employers
```

#### Authenticated Endpoints
```typescript
GET /api/user/profile                 // Current user profile
PUT /api/user/profile                 // Update profile
GET /api/user/reviews                 // User's own reviews (all statuses)
POST /api/reviews                     // Submit new review
PUT /api/reviews/[id]                 // Edit pending review
POST /api/appeals                     // Submit appeal for rejected review
```

#### Moderator Endpoints
```typescript
GET /api/moderation/queue             // Pending reviews to moderate
PUT /api/moderation/queue/[id]        // Assign review to self
POST /api/moderation/review/[id]      // Approve/reject review
GET /api/moderation/appeals           // Pending appeals
POST /api/moderation/appeals/[id]     // Resolve appeal
```

### Frontend Component Structure

#### Page Components
```
pages/
├── index.tsx                     // Homepage with search
├── employers/
│   ├── index.tsx                 // Employer directory
│   ├── [id].tsx                  // Individual employer page
│   └── search.tsx                // Search results
├── reviews/
│   ├── [id].tsx                  // Individual review page
│   └── submit.tsx                // Review submission form
├── auth/
│   ├── login.tsx                 // Login page
│   ├── register.tsx              // Registration with disclaimers
│   └── forgot-password.tsx       // Password reset
├── dashboard/
│   ├── index.tsx                 // User dashboard
│   ├── reviews.tsx               // My reviews with status
│   ├── appeals.tsx               // Appeal history
│   └── profile.tsx               // Profile management
├── moderation/
│   ├── queue.tsx                 // Moderation queue
│   ├── review/[id].tsx           // Individual review moderation
│   └── appeals.tsx               // Appeals management
└── admin/
    ├── dashboard.tsx             // Admin dashboard
    ├── users.tsx                 // User management
    ├── employers.tsx             // Employer directory management
    └── analytics.tsx             // Platform analytics
```

#### Reusable Components
```
components/
├── ui/                           // ShadCN base components
├── auth/
│   ├── AuthProvider.tsx          // Authentication context
│   ├── ProtectedRoute.tsx        // Route protection
│   └── RoleGate.tsx              // Role-based component access
├── reviews/
│   ├── ReviewCard.tsx            // Individual review display
│   ├── ReviewForm.tsx            // Review submission form
│   ├── RatingStars.tsx           // Star rating widget
│   ├── ReviewStatusBadge.tsx     // Status indicator (pending/approved/rejected)
│   ├── VerificationBadge.tsx     // Unverified badge (future: verified badges)
│   └── HelpfulnessVoting.tsx     // Helpful/not helpful buttons
├── employers/
│   ├── EmployerCard.tsx          // Employer listing card
│   ├── EmployerSearch.tsx        // Search/filter component
│   └── EmployerStats.tsx         // Aggregate rating display
├── moderation/
│   ├── ModerationCard.tsx        // Review moderation interface
│   ├── AIRecommendation.tsx      // AI analysis display
│   ├── ModerationQueue.tsx       // Queue management
│   └── AppealForm.tsx            // Appeal submission
└── layout/
    ├── Header.tsx                // Navigation with role-based menus
    ├── Footer.tsx                // Footer with legal links
    ├── Sidebar.tsx               // Dashboard sidebar
    └── Layout.tsx                // Page wrapper
```

### Moderation Workflow

#### AI-Assisted Human Review Process

```typescript
interface ModerationAnalysis {
  riskScore: number;          // 1-10
  recommendation: 'approve' | 'review_carefully' | 'reject';
  confidence: number;         // 0-100%
  flaggedIssues: string[];    // Specific concerns
  reasoning: string;          // Detailed explanation
  suggestedActions: string[]; // Recommended edits
}
```

#### Moderator Interface Design
```
┌─────────────────────────────────────────────────────┐
│ 🔴 HIGH PRIORITY │ Risk Score: 8/10 │ Unverified    │
├─────────────────────────────────────────────────────┤
│ AI RECOMMENDATION: REVIEW CAREFULLY                 │
│ Confidence: 85%                                     │
│                                                     │
│ DETAILED AI REASONING:                              │
│ • Post mentions "Dr. Smith" by name (potential      │
│   privacy/defamation concern)                       │
│ • Language analysis shows high emotional intensity  │
│ • Contains legitimate workplace safety concerns     │
│ • No PHI detected                                   │
│ • User history shows 3 previous approved reviews   │
│                                                     │
│ SUGGESTED ACTIONS:                                  │
│ • Replace "Dr. Smith" with "management"             │
│ • Request specific examples for broad accusations   │
│ • Preserve safety/staffing concerns (core value)   │
│                                                     │
│ [ APPROVE ] [ REJECT ] [ REQUEST REVISION ]        │
│ [ APPROVE WITH EDITS ] [ ESCALATE TO SENIOR ]      │
└─────────────────────────────────────────────────────┘
```

### Implementation Roadmap

#### Phase 1: MVP (3 months)
**Core Features:**
- User authentication (Supabase Auth)
- Employer directory for Southern California
- Review submission with rating categories
- Human moderation workflow
- Basic AI content analysis
- Public review display with unverified badges
- User dashboard with review status

**Technical Implementation:**
- Next.js app with ShadCN components
- Supabase database with RLS policies
- Basic moderation queue interface
- Vercel deployment

#### Phase 2: Enhanced Features (3-6 months)
**Community Features:**
- Helpfulness voting system
- Advanced search and filtering
- Review appeals process
- Employer statistics dashboard
- User reputation system

**Moderation Improvements:**
- Enhanced AI analysis with detailed reasoning
- Batch moderation tools
- Moderator performance analytics

#### Phase 3: Advanced Platform (6-12 months)
**Analytics & Insights:**
- Trend analysis dashboards
- Comparative employer analytics
- Regional healthcare insights
- Mobile app (React Native/Expo)

**Professional Features:**
- Professional verification system implementation
- Healthcare organization dashboards
- Integration with nursing associations
- Mentoring/networking features

### Performance & Security Considerations

#### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_reviews_employer_approved ON reviews(employer_id, status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX idx_employers_location ON employers(city, state);
CREATE INDEX idx_moderation_queue_priority ON moderation_queue(priority DESC, created_at);
```

#### Rate Limiting
- **Review submissions:** 3 per day per user
- **API requests:** 100 per minute per IP
- **Search queries:** 30 per minute per user

#### Caching Strategy
- **Employer statistics:** 1 hour cache
- **Review aggregations:** 30 minutes cache
- **Search results:** 15 minutes cache
- **Static content:** CDN cached

---

## Key Legal & Compliance Framework

### Required User Disclaimers
*"This platform contains unverified reviews from users who may or may not be healthcare professionals. All reviews should be considered alongside other sources when making employment decisions. We moderate content for appropriate language and legal compliance but cannot verify the accuracy or authenticity of workplace claims."*

### Content Moderation Standards
- **Focus:** Legal compliance (libel/slander), platform guidelines, appropriate content
- **Approach:** Conservative moderation with clear appeals process
- **Tools:** AI-assisted flagging + human review + transparent user communication

### Privacy & Data Protection
- **Anonymization:** Reviews permanently de-linked from user identities
- **Data retention:** Clear policies for user data and review content
- **Right to deletion:** Users can request account and review removal
- **Minimal data collection:** Only necessary information for platform function

---

## Next Steps: Build Phase

### Immediate Development Tasks
1. **Project Setup:** Scaffold Next.js project with Supabase integration
2. **Authentication:** Implement user registration/login with disclaimers
3. **Database:** Deploy schema with RLS policies to Supabase
4. **Core UI:** Build employer directory and review submission forms
5. **Moderation:** Create basic moderation queue interface
6. **Deployment:** Set up Vercel deployment pipeline

### Success Metrics
- **User Registration:** Target 100+ registered nurses in first month
- **Review Quality:** <5% rejection rate for moderated content
- **User Engagement:** Average 2+ reviews per active user
- **Platform Health:** 24-48 hour moderation turnaround time

### Risk Monitoring
- **Legal Issues:** Track and respond to any employer complaints or legal challenges
- **Content Quality:** Monitor helpfulness voting patterns and user feedback
- **Technical Performance:** Ensure sub-2-second page load times and 99.9% uptime
- **Community Health:** Watch for review gaming or inappropriate content patterns

---

## Project Repository Structure

```
nurse-employment-app/
├── README.md
├── docs/
│   ├── design-session.md        // This conversation
│   ├── database-schema.sql      // Complete schema with RLS
│   ├── api-documentation.md     // Endpoint specifications
│   └── deployment-guide.md      // Setup and deployment instructions
├── src/
│   ├── app/                     // Next.js 14 app directory
│   ├── components/              // Reusable UI components
│   ├── lib/                     // Utilities and configurations
│   └── types/                   // TypeScript type definitions
├── supabase/
│   ├── migrations/              // Database migrations
│   ├── functions/               // Edge functions
│   └── config.toml              // Supabase configuration
└── tests/
    ├── unit/                    // Component and utility tests
    ├── integration/             // API and database tests
    └── e2e/                     // End-to-end user flow tests
```

---

*Generated from Design & Planning Session*  
*Date: [Current Date]*  
*Status: Ready for Build Phase Implementation*