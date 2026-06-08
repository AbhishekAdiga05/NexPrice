# NexPrice — Learning Concepts

Every concept used in this project, ordered from foundational to advanced, with where to learn each one.

---

## 1. JavaScript (ES6+)

**Concepts used:** Promises, async/await, destructuring, spread operator, array methods (map, filter, reduce, sort), arrow functions, template literals, optional chaining, nullish coalescing

**Where it appears:**
- Every file in the project

**Learn:** [javascript.info](https://javascript.info/) — free, thorough, interactive

---

## 2. React 19

**Concepts used:**
- Components and props
- `useState` — local component state
- `useEffect` — side effects on mount
- Client components (`"use client"`)
- Server components (default, async components)
- Event handling (onClick, onSubmit, onChange)
- Conditional rendering (ternary, &&)
- Lists and keys

**Key files:**
- `components/DealAnalyzer.js` — `useEffect` + `useState` for API fetching
- `components/SetPriceAlert.js` — form state with `useState`
- `components/PricePrediction.js` — self-fetching pattern with loading/error states

**Learn:** [React.dev](https://react.dev/learn) — official docs

---

## 3. Next.js 16 (App Router)

**Concepts used:**
- File-based routing (`app/insights/page.js` → `/insights`)
- `layout.js` — shared layout with NavBar
- `page.js` — each route's content
- `loading.js` — skeleton UI during navigation
- `not-found.js` — custom 404 page
- `error/page.js` — error page
- Server Actions (`"use server"`) — form mutations with `revalidatePath`
- `generateMetadata` — dynamic page titles/descriptions
- Dynamic routes (`app/products/[id]/page.js` → `/products/123`)
- API Routes (`app/api/.../route.js`)
- `redirect()` — server-side navigation
- `createClient()` — Supabase SSR client (server vs browser)

**Key files:**
- `app/actions.js` — all 12 server actions
- `app/layout.js` — root layout wrapping all pages
- `app/products/[id]/page.js` — dynamic route + metadata generation
- `app/api/products/[productId]/predict/route.js` — API route with cache logic

**Learn:** [Next.js Learn](https://nextjs.org/learn) — free interactive course

---

## 4. Tailwind CSS v4

**Concepts used:**
- Utility classes (`flex`, `grid`, `p-4`, `text-sm`, etc.)
- Responsive prefixes (`sm:`, `md:`, `lg:`)
- `@theme` custom theme variables in `globals.css`
- `@layer base` — global resets
- Arbitrary values (`text-[11px]`, `top-0.5`)
- `cn()` utility for conditional class merging
- Dark/light via CSS variables (prep for dark mode)
- Animations (`animate-pulse`, `animate-spin`)

**Key files:**
- `app/globals.css` — all theme variables
- Every component file — Tailwind classes throughout

**Learn:** [Tailwind Docs](https://tailwindcss.com/docs) — official docs

---

## 5. Framer Motion

**Concepts used:**
- `motion.div` — animated component wrapper
- `initial` / `animate` / `exit` — enter/leave animations
- `whileInView` — trigger when element scrolls into view
- `viewport: {{ once: true }}` — animate only once
- `layout` — smooth layout animations when items reorder
- `AnimatePresence` — animate elements being removed from DOM
- Spring transitions — `type: "spring", stiffness: 300, damping: 20`
- `whileHover` — hover-scale effects

**Key files:**
- `app/page.js` — landing page sections with scroll-triggered animations
- `components/ProductCard.js` — card entrance + layout animation

**Learn:** [Motion Docs](https://motion.dev/) — official, 10-minute read

---

## 6. Supabase (PostgreSQL)

**Concepts used:**
- Tables with UUID primary keys
- Foreign keys with `ON DELETE CASCADE`
- RLS (Row Level Security) policies
- Indexes for query performance
- Supabase client: `select`, `insert`, `update`, `delete`, `upsert`
- Query modifiers: `.eq()`, `.in()`, `.order()`, `.maybeSingle()`, `.single()`
- `onConflict` for upsert behavior
- Aggregation in JavaScript (not SQL): `reduce`, `filter`, `sort`

**Key files:**
- `supabase/migration_*.sql` — all 3 migration files
- `app/actions.js` — every Supabase query in the project

**Learn:** [Supabase Docs](https://supabase.com/docs) + [PostgreSQL Tutorial](https://www.postgresqltutorial.com/)

---

## 7. Authentication (Supabase SSR)

**Concepts used:**
- Google OAuth provider
- Server-side cookie session management
- `createClient()` — separate config for server and browser
- `getUser()` — fetch authenticated user
- `exchangeCodeForSession()` — OAuth redirect callback
- Auth callback route (`app/auth/callback/route.js`)
- RLS with `auth.uid()` — link DB rows to authenticated user
- Conditional rendering based on auth state

**Key files:**
- `app/auth/callback/route.js` — OAuth redirect handler
- `app/layout.js` — passes user to NavBar
- `app/page.js` — renders different UI for logged-in vs logged-out
- `components/AuthModal.js` — Google sign-in modal
- `components/AuthButton.js` — sign in / sign out button

**Learn:** [Supabase Auth Guide](https://supabase.com/docs/guides/auth) — official docs

---

## 8. External API Integration

**Concepts used:**
- `fetch()` with `POST` and custom headers
- API keys stored in `.env.local`
- JSON request/response parsing
- Structured error handling with try/catch
- Fallback chains (Gemini → rule-based, cache → live)
- Response validation (whitelisting allowed values, capping string length)
- Rate limiting via caching (24-hour prediction expiry)

**Key files:**
- `app/api/products/[productId]/predict/route.js` — Gemini + cache + fallback
- `app/api/products/[productId]/deal-analysis/route.js` — Gemini + rule-based fallback
- `lib/firecrawl.js` — scraping API

**Learn:** [MDN fetch docs](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) + read Gemini and Resend API docs

---

## 9. Cron Jobs (pg_cron)

**Concepts used:**
- Database-level scheduling with `cron.schedule()`
- HTTP POST to internal API route
- Query-based job logic (find due alerts → process them)
- Idempotent design (safe to re-run)
- Database cleanup for expired rows

**Key files:**
- `app/api/cron/check-prices/route.js` — daily price check cron
- `supabase/migration_*.sql` — cron job definitions

**Learn:** [pg_cron Docs](https://github.com/citusdata/pg_cron) — 5-minute read

---

## 10. Statistical Analysis (Deal Score)

**Concepts used:**
- Mean (average)
- Min / max — range calculation
- Standard deviation — price volatility
- Coefficient of variation — normalized volatility
- Weighted scoring — 4 factors with different weights (40/30/20/10)
- Score normalization — clamp results to 0–100
- Trend detection — comparing recent prices to older ones
- Scoring tiers — categorical labels (Great / Good / Fair / Poor)

**Key files:**
- `lib/deal-score.js` — the full algorithm
- `lib/buy-priority.js` — 3-factor priority scoring

**Learn:** [Khan Academy Statistics](https://www.khanacademy.org/math/statistics-probability) — free

---

## 11. AI Prompt Engineering

**Concepts used:**
- Structured prompts with clear sections (context, data, instructions, output format)
- JSON schema enforcement — `responseMimeType: "application/json"`
- Temperature tuning — `temperature: 0.2` for deterministic output
- Output validation — parse JSON, whitelist allowed values, cap lengths
- Fallback chains — AI fails → rule-based system takes over
- Caching strategy — avoid re-calling AI unnecessarily

**Key files:**
- `app/api/products/[productId]/predict/route.js` — prediction prompt
- `app/api/products/[productId]/deal-analysis/route.js` — analysis prompt

**Learn:** [Gemini Prompting Guide](https://ai.google.dev/gemini-api/docs/prompting) — official, 15-minute read

---

## Suggested Learning Path

| Order | Concept | Estimated Time |
|-------|---------|----------------|
| 1 | JavaScript ES6+ | 1–2 weeks |
| 2 | React basics | 1 week |
| 3 | Next.js App Router | 1 week |
| 4 | Tailwind CSS | 2–3 days |
| 5 | Supabase + PostgreSQL | 1 week |
| 6 | Framer Motion | 1 day |
| 7 | Auth + APIs + Cron | 3 days |
| 8 | Statistics + AI prompts | 3 days |

**Total: approximately 4–5 weeks if consistent.**

Use this project as a reference — read the code files alongside each linked resource above.
