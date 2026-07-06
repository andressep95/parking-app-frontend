# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
