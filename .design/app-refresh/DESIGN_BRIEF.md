# Design Brief: Bragi Books — App Refresh

## Problem

A self-hoster running Bragi Books opens the app on their phone to add a new audiobook they just downloaded. They're met with a card-in-card file browser that uses a third of the screen and a sidebar panel that's invisible. The colors don't signal anything — green means "submit" over there, red means "primary action" over here, gold floats around as decoration. The Processing page's spinner icon looks like the app is loading, not queuing. Nothing feels intentional. It looks like a prototype that got deployed.

## Solution

A design system refresh that makes every color mean exactly one thing, replaces generic icon choices with contextually accurate ones, and rebuilds the Import flow as a full-viewport, mobile-native experience. The app keeps its warm literary personality — burgundy and gold against a dark slate — but with enforced semantic discipline. When you see gold, it's informational. When you see green, something succeeded. When you see red, something needs attention or is dangerous. The Import page stops fighting its own container and becomes the full-screen tool it should be.

## Experience Principles

1. **Semantic color over decorative color** — Every use of red, gold, and green must map to a consistent meaning. A user who's seen one screen should be able to predict what a color means on any other screen.
2. **Native feel on the device you're holding** — The Import flow is used on mobile. It should feel like a native file picker, not a desktop widget scaled down. Full viewport, touch targets, sticky actions.
3. **Confidence over novelty** — This is a power tool. Users don't want to be surprised. Familiar patterns (Sonarr-family conventions) executed with higher craft are better than clever new patterns.

## Aesthetic Direction

- **Philosophy**: Functional warmth — the utility of a server dashboard with the material warmth of an old library. Dark slate backgrounds, burgundy and gold accents, generous but purposeful whitespace.
- **Tone**: Calm, authoritative, slightly warm. Not sterile. Not playful.
- **Reference points**: Sonarr, Radarr, Readarr (information density, dark-first, sidebar navigation, semantic status colors). Plex (cover art as first-class UI element). Audible's dark mode (typographic hierarchy for book metadata).
- **Anti-references**: Generic SaaS (blue primary buttons, white cards, Inter font, everything rounded-xl). Consumer apps that feel like they're trying to be friendly. Bootstrap out-of-the-box.

## Existing Patterns

The codebase has a well-structured SCSS design system. This refresh extends it — nothing is thrown away.

- **Typography**: Bootstrap system font stack. No custom font loaded. This is acceptable for a power tool.
- **Colors (current)**:
  - `$bragi-red: #8E2F3A` — currently overloaded as primary action + brand
  - `$honey-gold: #D8A13F` — scattered decoratively (count badges, sort icon, star icons, card headers)
  - `$bragi-green: #184A3A` — success buttons only
  - `$light-sidebar: #2C3E50` — slate sidebar
  - Dark surface stack: `#121212` bg → `#1E1E1E` card → `#2A2A2A` surface → `#3A3A3A` border
- **Spacing**: Bootstrap 5 spacing scale (rem-based, 0.25rem unit)
- **Components**: Sidebar (fixed 250px), PageHeader (sticky), LibraryBookCard (cover grid), FileExplorer, Pagination, ToastContainer — all reused unchanged unless noted below

## Color Semantic System (Target)

The primary output of the design system refresh:

| Color | Hex | Semantic Role | Used For |
|-------|-----|---------------|----------|
| Honey Gold | `#D8A13F` | Informational / Status | Active nav item, count badges, runtime display, processing status, metadata highlights |
| Bragi Red | `#8E2F3A` | Destructive / Alert | Delete actions, cancel buttons, error states, danger alerts |
| Bragi Green | `#184A3A` | Success / Confirm | Submit/complete primary actions (Import, Save), success toasts, DONE status |
| Slate | `#2C3E50` | Navigation / Chrome | Sidebar background (unchanged) |

**The key shift**: Green becomes the primary action color for "do the good thing" (submit, save, confirm). Red is reserved for destructive and error. Gold is purely informational — never on a button.

## Icon Audit (Target)

All Font Awesome Solid. Replace the following:

| Location | Current Icon | Replacement | Reason |
|----------|-------------|-------------|--------|
| Sidebar: Processing | `fa-spinner` | `fa-list-check` | Spinner implies loading state, not a job queue |
| Sidebar: Library | `fa-book` | `fa-headphones` | This is an audiobook app |
| Sidebar: Import | `fa-file-import` | `fa-folder-plus` | More accurately represents "add a directory" |
| Brand / Logo | `fa-scroll` | `fa-scroll` | Keep — it's distinctive and on-theme |
| Book Detail: chapters | `fa-list` | `fa-list-ol` | Chapters are ordered |
| Processing: running job | `fa-circle-info` | `fa-circle-dot` | Info is passive; dot implies live activity |

## Component Inventory

| Component | Status | Notes |
|-----------|--------|-------|
| `styles.scss` color variables | Modify | Add semantic role comments, enforce usage rules, switch dark mode to default |
| `Sidebar.tsx` | Modify | Update icon choices per audit above |
| `FileExplorer` (Import Step 1) | Modify | Remove card wrapper; render full-viewport with sticky bottom action bar |
| Import Step 1 layout | Modify | Full-screen layout: file tree fills viewport, sticky bar shows "N selected · Next →" |
| Import Step 2 cards | Modify | Polish cover image sizing, typography hierarchy, tighten spacing for mobile |
| `btn-success` usage | Modify | Audit all `btn-success` (green) — confirm they are all success/confirm actions, not just "primary" |
| `btn-primary` usage | Modify | Audit all `btn-primary` (red) — should only appear on destructive or alert-adjacent actions |
| `PageHeader.tsx` | No change | Already solid |
| `LibraryBookCard.tsx` | No change | Works well |
| `ProcessingPage.tsx` | No change (icons only) | Processing section logic is good; just icon replacement |
| Dark mode as default | Modify | Flip `ThemeContext` default from `light` to `dark` |

## Key Interactions

**Import Step 1 — full-screen file browser:**
- File tree fills the full content area with no card wrapper
- Each directory row is a full-width tap target (min 44px height)
- Checking an item adds it to a selection count in the sticky bottom bar
- Bottom bar: `[N selected] [Next →]` — disabled until N ≥ 1
- On desktop, the bottom bar stays in the content footer; on mobile it pins to the bottom of the viewport
- Back navigation: standard browser back or sidebar nav (no "Back" button needed at this step)

**Import Step 2 — ASIN matching:**
- Each book renders as a horizontal card: cover (80×80) | directory name | match dropdown
- Auto-search fires immediately; spinner shows inline next to the dropdown while searching
- Once resolved, dropdown shows top match pre-selected — user scans, adjusts if needed
- Manual ASIN input appears only when "Enter manually…" is selected in the dropdown
- Remove button (×) is subtle — icon only, top-right of card — not a full button taking layout space
- Submit bar is sticky at the bottom: `[Submit N books →]` disabled until all cards have a valid ASIN

**Color state feedback:**
- DONE status badge: green background
- ERROR status badge: red background
- PROCESSING status badge: gold background with animated dot
- All cancel/delete buttons: red outline, red filled on confirm

## Responsive Behavior

| Breakpoint | Import Step 1 | Import Step 2 | Library |
|------------|--------------|--------------|---------|
| Mobile (<768px) | Full-screen tree, sticky bottom bar pins to viewport bottom | Single-column cards, cover 60×60 | 3-column grid (unchanged) |
| Tablet (768–1024px) | Full-screen tree, bottom bar in content flow | Single-column cards, cover 80×80 | 3-column grid |
| Desktop (>1024px) | Full-screen tree with optional right panel showing selection count | Two-column cards possible | 4–5 column grid (unchanged) |

The sidebar collapses to a mobile top nav on <768px (existing behavior, unchanged).

## Accessibility Requirements

- All interactive elements minimum 44×44px touch target on mobile
- Color must not be the sole differentiator for status — pair color with icon or text label
- Keyboard navigation: Tab order follows visual reading order; file tree items are keyboard-navigable with Space to select
- Contrast: dark mode text (`#E0E0E0`) on dark card (`#1E1E1E`) = ~7:1 ✓; gold (`#D8A13F`) on dark bg (`#121212`) = ~6.5:1 ✓; red (`#8E2F3A`) on dark — use lightened variant `#C04050` for text-on-dark to maintain contrast
- Focus rings: visible on all interactive elements (Bootstrap's default focus ring is acceptable)

## Login Page

The login page lives outside the sidebar shell and needs its own full-screen treatment. Currently it renders as a plain card floating in the body background — in light mode it's a white card on white, in dark mode it's nearly invisible.

**Target design:**
- Full-screen background using the sidebar color (`#2C3E50` light / `#1A1F2E` dark) — not the body background. This grounds the login in the app's visual identity before the user is authenticated.
- The login card sits centered with a clear box-shadow to separate it from the background (`0 8px 32px rgba(0,0,0,0.4)` in dark mode).
- Brand mark: `fa-scroll` in gold + "BragíBooks" in a larger `h2` — matches the sidebar brand treatment.
- "Sign in with a passkey" button uses `btn-outline-light` (not `btn-outline-secondary`) when on the dark background so it reads correctly.
- `btn-success` for the primary Sign In action is **correct** under the new semantic system — keep it.
- No background image or pattern — the solid sidebar color is enough. Clean, tool-like.

| Component | Status | Notes |
|-----------|--------|-------|
| `LoginPage.tsx` outer wrapper | Modify | Replace body-bg with sidebar-color full-screen background |
| Login card | Modify | Add box-shadow, ensure dark mode card bg is `#2A2A2A` (surface) not `#1E1E1E` for contrast |
| Passkey button | Modify | `btn-outline-light` when on dark sidebar background |
| `SetupPage.tsx` | Modify | Apply same treatment — it has the same floating-card problem |

## Out of Scope

- Typography overhaul (adding a custom font is a separate decision)
- Library page layout changes
- Book Detail page redesign
- Settings pages
- Backend / API changes
- Animation and motion design (transitions are existing Bootstrap defaults)
- New features (search within file explorer, bulk operations beyond current scope)
