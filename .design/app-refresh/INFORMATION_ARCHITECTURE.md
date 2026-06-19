# Information Architecture: Bragi Books

## Site Map

```
/login                          ← Unauthenticated entry point
/setup                          ← First-run setup (one-time)
/ (authenticated shell)
├── /import                     ← Primary action: add new audiobooks
├── /                           ← Library (home) — completed books grid
│   └── /books/:id              ← Book detail: metadata, chapters, cover
├── /processing                 ← Job queue: running, errors, recently done
└── /settings
    ├── /settings/configuration ← App config (paths, API, encoding)
    ├── /settings/security      ← Passkeys, password change
    ├── /settings/users         ← User management (superuser only)
    └── /settings/about         ← Version info, credits
```

Redirects preserved: `/queue` → `/processing`, `/import-history` → `/processing`

## Navigation Model

- **Primary navigation**: Fixed left sidebar (250px). Items in priority order:
  1. Import (`/import`) — action-first, most frequent entry point
  2. Library (`/`) — where users spend most of their time after importing
  3. Processing (`/processing`) — checked reactively when jobs are running
  4. Settings (expandable section) — infrequent, grouped to reduce visual weight

  Maximum 4 top-level items + 1 expandable group. No further nesting beyond the Settings subtree.

- **Secondary navigation**: None at the top level. Book Detail has an implicit back link to the library. Import uses a step indicator (Step 1 / Step 2) within the page — not a separate route.

- **Utility navigation**: Sidebar footer holds logout + current user display. Theme toggle lives here too. No separate account page.

- **Mobile navigation**: Sidebar slides in from the left behind a hamburger trigger in the mobile top bar. The top bar is fixed, 60px tall, shows the scroll logo and hamburger only. No bottom tab bar — the existing slide-in pattern is kept.

## Content Hierarchy

### Import Page (`/import`)

**Step 1 — File Selection**
1. File tree (full viewport) — the primary interaction; everything else is secondary
2. Sticky bottom bar: selection count + Next button — always visible, follows scroll
3. Error message (if path unreadable) — shown inline, non-blocking

**Step 2 — ASIN Matching**
1. Per-book card: cover + directory name + match dropdown — one card per selected directory
2. Manual ASIN input — appears only when "Enter manually…" is chosen; not shown by default
3. Remove (×) button — available but visually quiet; destructive, so de-emphasized
4. Sticky bottom bar: Submit button + count — same pattern as Step 1 for consistency
5. Back button — in the page header, not the sticky bar

### Library (`/`)
1. Book grid (cover art dominant) — the content itself
2. Search + sort controls (sticky header) — filters visible without scrolling
3. Pagination — below the grid, only when needed
4. Empty state with CTA to Import — when library is empty

### Book Detail (`/books/:id`)
1. Cover + title + author/narrator + runtime — identity block, above the fold
2. Description — rich text, below identity
3. Chapter list (collapsible) — editable; collapsed by default if long
4. File info (source path, output path, format) — below chapters
5. Action buttons (replace cover, reprocess, delete) — bottom of page, destructive actions de-emphasized

### Processing (`/processing`)
1. Currently processing jobs — animated, live-updating; most urgent
2. Errors — need user attention; shown second with expand-for-logs
3. Recently completed (last 10) — confirmation, low urgency; shown last

### Settings
1. Configuration — paths, API URL, encoding options; the most-visited settings page
2. Security — passkeys; visited once during setup then rarely
3. Users — admin only; infrequent
4. About — version info; rarely visited

## User Flows

### Primary Flow: Import a new audiobook
1. User lands on `/import` (or navigates there from sidebar)
2. File tree loads; user browses and checks one or more directories
3. Sticky bar shows count; user taps "Next →"
4. Step 2 renders: each directory shows a card with auto-searched ASIN pre-selected
5. User scans matches — if correct, no action needed
   - If wrong → user selects different option from dropdown
   - If nothing found → user selects "Enter manually…" and types ASIN
6. User taps "Submit N books →" in sticky bar
7. App calls `/api/import/start/` then `/api/match/` → navigates to `/processing`
8. User sees their books appear under "Currently Processing"
9. When job completes, books appear in "Recently Completed"
10. User taps a book → lands on `/books/:id` to verify metadata and cover

### Reactive Flow: Check on a running job
1. User opens app (mobile or desktop) → sidebar shows Processing
2. User taps Processing → sees live progress bar + current status line
3. If job is stuck → user taps expand chevron to see full log
4. If job needs to be cancelled → user taps ×, confirms inline → job moves to Errors

### Error Recovery Flow
1. User sees book in Errors section of Processing
2. User expands log to understand the failure
3. User optionally enters a different ASIN in the input field
4. User taps "Re-process" → job re-enters the queue

### Library Browse Flow
1. User lands on `/` → sees full cover grid
2. User types in search box (expands on focus) to filter
3. User taps a cover → navigates to `/books/:id` with library scroll position preserved
4. User taps browser back → returns to library at same scroll + filter state

## Naming Conventions

| Concept | Label in UI | Notes |
|---------|-------------|-------|
| The main book grid | Library | Not "Collection" or "Shelf" — matches sidebar label |
| Adding new books | Import | Not "Add" or "Upload" — files are local, not uploaded |
| ASIN lookup / title match | Match | Not "Search" or "Link" — user is matching a file to a record |
| The conversion job | Processing | Not "Converting" or "Queue" — matches sidebar label |
| A failed job | Error | Not "Failed" — shorter, consistent with StatusChoice enum |
| Completed job | Done | Not "Complete" or "Finished" — matches StatusChoice enum |
| The output .m4b file | Processed file / output | Not "converted file" in UI — "converted" is a DB flag, not user-facing |
| Passkey | Passkey | Not "WebAuthn" or "biometric" — standard browser terminology |

## Component Reuse Map

| Component | Used on | Behavior differences |
|-----------|---------|---------------------|
| `Sidebar` | All authenticated pages | Collapses to mobile top bar on <768px |
| `PageHeader` | Library, Processing, Settings pages | Sticky; accepts title + optional right-side slot for controls |
| `ToastContainer` | All authenticated pages | Global; mounted in Layout |
| `ErrorBoundary` | All authenticated pages | Wraps entire Layout |
| Sticky action bar (new) | Import Step 1, Import Step 2 | Same visual pattern; different labels and actions |
| Login card treatment | `/login`, `/setup` | Same full-screen sidebar-color background, centered card |

## Content Growth Plan

- **Library**: Grows unboundedly. Handled by pagination (25/50/100 per page) + client-side search/sort. No server-side pagination needed until the library reaches ~1,000+ books — current architecture is acceptable.
- **Processing / Recently Completed**: Capped at last 10 completed. Error section shows all errors until re-processed or deleted. No pagination needed.
- **Settings**: Fixed. Does not grow.
- **Chapter list** (Book Detail): Fixed per book. Editable in-place. No pagination.

## URL Strategy

- Pattern: `/section` for top-level, `/section/subsection` for settings, `/books/:id` for detail
- Dynamic segments: `:id` is the Django model PK (integer)
- No slugs — book titles can have special characters; PK is simpler and stable
- Query parameters: none currently used; future filtering could use `?q=` and `?sort=` on `/` if server-side filtering becomes necessary
- No hash routing; React Router uses the HTML5 history API
