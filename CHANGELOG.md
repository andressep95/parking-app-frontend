# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### [e78fb17] — 2026-07-05

**fix(layout): fix sidebar height, icon centering and hover jump**

> what: Makes the sidebar span the full viewport height with the header bar beside it instead of above it, anchors every collapsed-rail icon at a fixed offset instead of toggling justify-content (which caused icons to snap left when the sidebar expanded), and turns the nav/sign-out active-hover background into a fixed square that grows outward on hover instead of a full-width or off-center rectangle
> why: The header/sidebar nesting was backwards, icons looked left-biased and jumped position mid-transition, and the active pill looked like a stretched or lopsided rectangle instead of a clean centered square
> breaking: false

#### Changed

- `DESIGN.md`
- `src/components/Layout.tsx`
- `src/components/Sidebar.tsx`

---

### [68fc25a] — 2026-07-05

**feat(locations): add transactions tab and fix tariff crash**

> what: Adds a "Transacciones" tab to LocationDetailPage backed by the new GET /transactions endpoint, and fixes a crash where a null tariff.maxCharge from the API (checked with !== undefined instead of != null) threw on .toLocaleString()
> why: Admins need to see registered transactions per location, and the null check bug crashed the Tarifas tab whenever a tariff had no maxCharge set
> breaking: false

#### Added

- `src/api/transactions.ts`

#### Changed

- `src/pages/clients/LocationDetailPage.tsx`
- `src/types/index.ts`

---

### [5f5a113] — 2026-07-05

**feat(layout): add persistent full-width header bar**

> what: Adds a HeaderBar above the sidebar+content row that always spans the full viewport width and renders the current page's breadcrumb via a new BreadcrumbContext/usePageBreadcrumb hook instead of each page rendering Breadcrumb inline; widens the sidebar's collapsed rail from 48px to 60px to match the header's height
> why: Mirrors the Cloudflare-style dashboard layout the user asked for, where the top bar is always visible and its height matches the icon rail width
> breaking: false

#### Added

- `src/components/BreadcrumbContext.tsx`

#### Changed

- `DESIGN.md`
- `src/components/Breadcrumb.tsx`
- `src/components/Layout.tsx`
- `src/components/Sidebar.tsx`
- `src/pages/clients/ClientDetailPage.tsx`
- `src/pages/clients/ClientsPage.tsx`
- `src/pages/clients/LocationDetailPage.tsx`

---

### [654f21f] — 2026-07-05

**feat(clients): add breadcrumb trail and card-wrapped headers**

> what: Adds a shared Breadcrumb component showing the full navigation path (Clientes > cliente > instalación) and wraps entity header blocks in cards per a new "no loose content on the page background" design rule
> why: Detail pages only showed a one-level back link, and client/location headers floated directly on the gray page background instead of standing out like the rest of the card-based UI
> breaking: false

#### Added

- `src/components/Breadcrumb.tsx`

#### Changed

- `DESIGN.md`
- `src/pages/clients/ClientDetailPage.tsx`
- `src/pages/clients/LocationDetailPage.tsx`

---

### [a9a9094] — 2026-07-05

**refactor(clients): remove non-Clientes views and routes**

> what: Reduces the app to only the Clientes flow (routes, sidebar, redirects) and deletes the Dashboard/Usuarios/Organizaciones/Locaciones/Terminales/Tarifas top-level pages and their form modals
> why: The admin UI is being rebuilt around Clientes first; those views were unfocused and premature while API layers stay intact in src/api for later reuse
> breaking: false

#### Changed

- `src/App.tsx`
- `src/auth/ProtectedRoute.tsx`
- `src/components/Sidebar.tsx`
- `src/pages/auth/CallbackPage.tsx`
- `src/pages/auth/LoginPage.tsx`

#### Removed

- `src/pages/dashboard/DashboardPage.tsx`
- `src/pages/locations/LocationsPage.tsx`
- `src/pages/organizations/OrgFormModal.tsx`
- `src/pages/organizations/OrganizationsPage.tsx`
- `src/pages/tariffs/TariffsPage.tsx`
- `src/pages/terminals/TerminalsPage.tsx`
- `src/pages/users/ResetPasswordModal.tsx`
- `src/pages/users/UserFormModal.tsx`
- `src/pages/users/UsersPage.tsx`

---

### [5585e8f] — 2026-06-30

**feat(tariff): add dynamic three-type tariff form and table**

> what: Replaces fixed price-per-hour form with a type-selector UI
> supporting PER_MINUTE (with max cap and grace period), BRACKET
> (editable tiers table with open-ended last row), and FLAT_ENTRY
> (fixed charge on entry); updates types, table columns, and

#### Changed

- `src/components/FormModal.tsx`
- `src/pages/tariffs/TariffFormModal.tsx`
- `src/pages/tariffs/TariffsPage.tsx`
- `src/types/index.ts`

---

### [89d65f5] — 2026-06-30

**feat(app): initial frontend setup with Cloudflare-style UI and client hierarchy**

> what: Bootstraps parking admin dashboard with collapsible sidebar, full CRUD for
> clients/installations/operators/terminals/tariffs, and encapsulated
> client → installation hierarchy following domain rules from US-008
> why:  Establishes the base frontend architecture with shadcn-inspired design

_No file changes detected._

---
