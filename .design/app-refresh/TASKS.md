# Build Tasks: Bragi Books App Refresh

Generated from: `.design/app-refresh/DESIGN_BRIEF.md`  
Date: 2026-06-18

---

## Foundation

- [ ] **Wire design tokens into styles.scss**: Replace the existing raw SCSS variable block in `styles.scss` with `@use 'tokens'` (importing `_tokens.scss`). Remove duplicate variable declarations that are now defined in `_tokens.scss`. Verify Bootstrap still compiles — Bootstrap overrides must come from `_tokens.scss` before `@import "bootstrap/scss/bootstrap"`. _Modifies: `frontend/src/styles.scss`, `frontend/src/_tokens.scss` (already created)._

- [ ] **Flip to dark-first default**: In `ThemeContext.tsx`, change the initial state from `'light'` to `'dark'`. Verify the app loads dark on first visit, and that the light/dark toggle still persists to localStorage correctly. _Modifies: `frontend/src/context/ThemeContext.tsx`._

---

## Core UI — High Visibility First

- [ ] **Sidebar icon audit**: Replace the four flagged icons in `Sidebar.tsx`: `fa-book` → `fa-headphones` (Library), `fa-spinner` → `fa-list-check` (Processing), `fa-file-import` → `fa-folder-plus` (Import). Verify all three nav items still show correct active state and mobile sidebar behavior is unchanged. _Modifies: `frontend/src/components/Sidebar.tsx`._

- [ ] **Login page — full-screen brand treatment**: Wrap the login card in a full-viewport container using `var(--login-page-bg)` (sidebar color) as the background instead of the body background. Add `var(--shadow-login)` to the card. Change the passkey button from `btn-outline-secondary` to `btn-outline-light` (it now sits on a dark background). Keep `btn-success` for the Sign In button — this is correct under the new semantic system. Verify in both light and dark mode: background should be the slate color regardless of theme. _Modifies: `frontend/src/pages/LoginPage.tsx`._

- [ ] **Setup page — same brand treatment as login**: Apply identical full-screen sidebar-color background and card shadow treatment to `SetupPage.tsx`. Audit button choices here too. _Modifies: `frontend/src/pages/SetupPage.tsx`._

---

## Core UI — Import Flow

- [ ] **Import Step 1 — full-viewport file browser**: Remove the `<div className="card">` / `card-body` / `card-header` wrapper from the Step 1 render. The `<FileExplorer>` component should fill the full content area (no outer container restricting height). Add a sticky action bar at the bottom of the viewport (not the card footer): `N selected · Next →` button — disabled when nothing is selected, `btn-success` when active. On mobile (<768px), the bar must pin to the bottom of the viewport using `position: fixed; bottom: 0; left: var(--sidebar-width)` (and `left: 0` on mobile where sidebar is hidden). _Modifies: `frontend/src/pages/ImportPage.tsx`. Adds: sticky bar styles in `styles.scss`._

- [ ] **Import Step 2 — polished match cards**: Redesign each book card in the Step 2 list. Cover image: 80×80, border-radius `var(--radius-md)`. While auto-searching, show a spinner inline next to a "Searching Audible…" label — not replacing the whole card. Remove button: change from `btn btn-outline-danger` full button to a quiet `×` icon button (`btn-link text-danger`) positioned top-right of the card. Apply the same sticky bottom action bar pattern as Step 1: `Submit N books →` (`btn-success`), disabled until all cards have a valid ASIN. _Modifies: `frontend/src/pages/ImportPage.tsx`._

---

## Interactions & States

- [ ] **Color semantic audit — buttons**: Search every `.tsx` file for `btn-primary` and `btn-success`. For each occurrence: `btn-success` should be used for constructive primary actions (Submit, Save, Next, Confirm). `btn-primary` (red) should be used only for destructive or alert-adjacent actions. `btn-outline-danger` / `btn-danger` for cancel, delete. Correct any mismatches. Expected changes: the "Re-process" button on ProcessingPage → `btn-success`; any "Add"/"Save" buttons currently on `btn-primary` → `btn-success`. _Modifies: multiple page files._

- [ ] **Processing page icon fix**: Replace `fa-circle-info` with `fa-circle-dot` on the inline status line in `ProcessingPage.tsx` (the icon shown next to the last milestone log line on a running job). The info icon implies a static tooltip; dot implies live activity. _Modifies: `frontend/src/pages/ProcessingPage.tsx`._

- [ ] **Status badge tokens**: Apply the new semantic badge tokens (`--badge-processing-*`, `--badge-done-*`, `--badge-error-*`) to status indicators wherever they appear (ProcessingPage, BookDetailPage). Processing = gold background + gold text. Done = green. Error = red. Ensure color is never the only differentiator — each badge must also have a text label or icon. _Modifies: `frontend/src/pages/ProcessingPage.tsx`, `frontend/src/pages/BookDetailPage.tsx`._

---

## Responsive & Polish

- [ ] **Import flow — mobile pass**: Test Import Step 1 and Step 2 at 375px viewport width. The sticky action bar must not overlap the file tree or card list content (add `padding-bottom` equal to bar height on the scrollable area). Touch targets on file tree rows must be minimum 44px tall. Verify the sidebar is hidden and the action bar spans the full width on mobile. _Modifies: `frontend/src/pages/ImportPage.tsx`, `frontend/src/styles.scss`._

- [ ] **Dark mode audit — CSS custom property pass**: Replace any remaining hardcoded hex values in `styles.scss` dark mode block (`[data-theme="dark"]`) with the new `var(--color-*)` tokens. The old `$dark-bg`, `$dark-card-bg`, `$dark-surface`, `$dark-border`, `$dark-sidebar` SCSS variables should be replaced by token references. Verify: cards, form controls, list groups, tables, modals, alerts all render correctly with the new warm-violet dark surfaces. _Modifies: `frontend/src/styles.scss`._

- [ ] **Accessibility pass**: Verify: (1) All interactive elements in the Import flow have 44×44px minimum touch target. (2) The sticky action bar Next/Submit buttons have a visible focus ring using `var(--color-border-focus)` (gold). (3) Status badges pair color with a text label — never color alone. (4) Gold (`#D8A13F`) used as text on dark surfaces passes 4.5:1 (it does — ~6.5:1). Burgundy text on dark uses `#C04050` (lightened variant) — verify this is applied in error states on dark mode. _Touches: `styles.scss`, any component using status colors._

---

## Review

- [ ] **Design review**: Run `/design-review` against the brief. Focus on: (1) Does every button color match its semantic role? (2) Does the Import Step 1 feel native on mobile — no card wrapper, sticky bar accessible? (3) Does the login page feel anchored to the app's identity? (4) Are there any remaining hardcoded colors that should be tokens?
