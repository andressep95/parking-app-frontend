# DESIGN.md — Parking App Frontend

> Reference document for AI tools and agents. Describes the design system, component patterns, information architecture, and UI decisions for this project. All generated or modified UI must conform to this spec.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 (no CSS-in-JS) |
| Data fetching | TanStack Query v5 |
| Auth | AWS Amplify v6 / Cognito |
| Build | Vite |
| Component style | shadcn/ui aesthetic — no shadcn library installed yet |

---

## Design Language

The visual style mirrors **shadcn/ui** structure (clean, minimal, generous whitespace, subtle borders instead of heavy shadows) but with the **brand color and shape language of the mobile operator app** layered on top, so web and mobile feel like the same product.

> **Brand reference:** `img/operation_entry_screen.png` and `img/operation_exit_screen.png` are the source of truth for brand blue, the success/green accent, chip and segmented-control shapes, and button radius. When in doubt about a color or shape, match those screenshots rather than generic Tailwind defaults.

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `brand-50` | `#f2f5fd` | Light tints, active-nav pill background |
| `brand-100` | `#e0e7fb` | Badge/chip backgrounds |
| `brand-200` | `#bccbf6` | Subtle borders on brand-tinted surfaces |
| `brand-500` | `#436ce5` | Focus rings, input focus borders |
| `brand-600` | `#3662e3` | Primary actions, active nav text, CTA buttons, active segmented-tab fill — sampled directly from the mobile app's ENTRADA/SALIDA toggle |
| `brand-700` | `#1b47c5` | Button hover states |
| `brand-800` | `#163aa1` | Dark accents |
| `brand-900` | `#122f82` | Darkest brand accent |
| `success-50` | `#ecfdf5` | "Active"/"Online" badge background, mirrors mobile's "Libres" stat card |
| `success-200` | `#a7f3d0` | Badge border |
| `success-700` | `#047857` | "Active"/"Online" badge text |
| `gray-50` | Tailwind default | Page background |
| `gray-200` | Tailwind default | Panel/table borders, dividers |
| `gray-900` | Tailwind default | Page titles, primary text (never as a button background) |

> Primary buttons must use `bg-brand-600` — never `bg-gray-900`/black. Black CTAs read as flat and off-brand next to the mobile app's blue.

### Typography

- Font: system-ui (browser default — no custom font loaded)
- Base size: `text-sm` (14px) for body and nav
- Page titles: `text-2xl font-bold text-gray-900`
- Section labels: `text-xs font-semibold uppercase text-gray-500 tracking-wider`
- Table headers: `text-xs font-semibold uppercase text-gray-500`

### Spacing & Radius

- Card/panel padding: `p-6`
- Input/button radius: `rounded-xl` (12px) — softer than default shadcn, matches the mobile app's form fields and CTA
- Chips / segmented-tab pills / nav active state: `rounded-full` or `rounded-lg` inside a `rounded-xl` pill container
- Sidebar nav item radius: `rounded`
- Table row: no radius, full-width
- Modal: `rounded-2xl`

### Elevation

Avoid heavy `box-shadow`. Use `border border-gray-200` for panels. Modals get `shadow-xl` + `backdrop-blur-sm` on the overlay.

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (hover-expand)  │  Main content area             │
│  w-52 (hovered)          │  flex-1, overflow-y-auto       │
│  w-12 (default)          │  p-6 or p-8                    │
└──────────────────────────────────────────────────────────┘
```

The `Layout` component (`src/components/Layout.tsx`) renders `<Sidebar />` + `<Outlet />`.

---

## Sidebar — Hover-expand

### Behavior

- **Default** (`w-12`): Icon-only rail.
- **Hovered** (`group-hover:w-52`): Expands to show icon + label. No toggle button or persisted state — purely a CSS hover transition on the parent `group`.
- Nav items are filtered by permission (e.g. "Clientes" only renders for `canManageOrgs`), so the list can be a single item.

### Anatomy (hovered)

```
┌─────────────────────┐
│  [P]  Parking App   │  ← Logo mark (bg-brand-600) + name
├─────────────────────┤
│  🏢  Clientes       │  ← currently the only nav item (ADMIN only)
├─────────────────────┤
│  [avatar] Nombre    │  ← User info
│           ADMIN     │
│  ↩  Cerrar sesión   │
└─────────────────────┘
```

### Anatomy (default, w-12)

```
┌────┐
│ P  │  ← Logo mark only
├────┤
│ 🏢 │
├────┤
│ av │  ← Avatar only
│ ↩  │
└────┘
```

### Transition

`transition-[width] duration-200 ease-in-out` on the `<aside>`. Labels use `opacity-0 group-hover:opacity-100 transition-opacity duration-150 delay-75`.

### Active state

Active nav item: `bg-brand-50 text-brand-700 font-medium` — a light brand-tinted pill, mirroring the mobile app's active bottom-nav item (light-blue pill behind the icon+label). Hover (inactive): `hover:bg-gray-50 hover:text-gray-700`.

> Only ADMIN-facing views (Clientes) exist in the UI today. CUSTOMER-facing views (Dashboard, Locaciones, Terminales, Tarifas as customer self-service) were intentionally removed to keep the app focused while the admin experience is built out — they'll return once the CUSTOMER flows are designed. Their API modules remain in `src/api/` untouched.

---

## Information Architecture

### Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Super admin — manages all clients, locations, users |
| `CUSTOMER` | Client-level admin — sees their org's data only |
| `OPERATOR` | Parking operator — assigned to a location |

### Entity Hierarchy

```
Cliente (Organization / Razón Social)
└── Instalación (Location)
    ├── Operators (Users with role OPERATOR assigned to this location)
    ├── Terminales (Terminals assigned to this location)
    └── Tarifas (Tariffs for this location)
```

A **Cliente** is a company (razón social) identified by `rutCompany`. Each cliente owns one or more **Instalaciones** (parking facilities). Each instalación manages its own operators, terminals, and tariffs — this logic is encapsulated within the instalación detail view.

---

## Navigation Structure

### Sidebar nav items

| Icon | Label | Route | Visibility |
|------|-------|-------|-----------|
| Building2 | Clientes | `/clients` | ADMIN only |

> **Note:** "Organizaciones" is renamed to **"Clientes"** everywhere in the UI. The route changes from `/organizations` to `/clients`. The underlying API entity remains `Organization`.
>
> Dashboard, Usuarios, Locaciones (top-level), Terminales (top-level) and Tarifas (top-level) were removed from navigation — see the note at the end of the Sidebar section above. `Locaciones`, `Terminales`, and `Tarifas` still exist as nested tabs/modals inside the Cliente detail flow (`ClientDetailPage`, `LocationDetailPage`).

---

## Page Patterns

### List page (e.g., Clientes)

```
PageHeader
  title: "Clientes"
  subtitle: "Gestiona razones sociales y sus instalaciones"
  action: <Button> + Nuevo cliente

DataTable
  columns: [name, rut, status, actions]
  row action: Ver detalle → navigates to /clients/:id
```

### Detail page — Cliente (`/clients/:id`)

```
Breadcrumb: Clientes > Nombre del cliente

PageHeader
  title: orgName
  subtitle: rutCompany · orgEmail
  badge: status (ACTIVE / INACTIVE)
  action: Editar cliente

Tabs (segmented pill control, see Component Patterns):
  [Instalaciones]  [Terminales]  [Información]

Tab — Instalaciones:
  DataTable of locations belonging to this org
  Row click → /clients/:id/locations/:locationId
  Action: + Nueva instalación

Tab — Terminales:
  Terminals belonging to this org
  Action: + Nuevo terminal
```

### Detail page — Instalación (`/clients/:clientId/locations/:locationId`)

```
Breadcrumb: Clientes > Nombre cliente > Nombre instalación

PageHeader
  title: locationName
  subtitle: address, city · capacity spots
  badge: status
  action: Editar instalación

Tabs (segmented pill control, see Component Patterns):
  [Operadores]  [Tarifas]

Tab — Operadores:
  Users with role=OPERATOR and locationId=this location
  Actions: Asignar operador, Desactivar

Tab — Tarifas:
  Tariffs for this location (tariffType: PER_MINUTE | BRACKET | FLAT_ENTRY)
  Columns: name, vehicleType, price (derived from tariffType), maxCharge, graceMinutes, validFrom, active
  Actions: + Nueva tarifa
```

---

## Component Patterns

### Button variants

| Variant | Classes | Usage |
|---------|---------|-------|
| Primary | `bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-medium` | Main CTA — never `bg-gray-900`/black |
| Secondary | `border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium` | Cancel, secondary actions |
| Destructive | `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium` | Delete, disable |
| Ghost | `text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-sm` | Table row actions |

### Segmented Tabs (pill control)

Mirrors the ENTRADA/SALIDA toggle from the mobile app's operation screen — used for tab groups instead of underlined tabs.

```tsx
<div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
  {tabs.map(({ key, label }) => (
    <button
      key={key}
      className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
        tab === key ? 'bg-brand-600 text-white' : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {tab === key ? <CheckIcon /> : null}
      {label}
    </button>
  ))}
</div>
```

Used in `ClientDetailPage` and `LocationDetailPage`.

### Status Badge

```tsx
// Active/Online → success; Inactive → gray; Offline → red; Maintenance → amber
<span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
  bg-success-50 text-success-700 border border-success-200">
  ACTIVE
</span>
```

See `src/components/Badge.tsx` for the full status→class map.

### DataTable

- Full-width wrapper: `rounded-xl border border-gray-200 overflow-hidden`, `divide-y divide-gray-200`
- Header: `bg-gray-50 text-xs font-semibold uppercase text-gray-500 px-4 py-3`
- Row: `px-4 py-3 text-sm text-gray-700 hover:bg-gray-50`
- Empty state: centered illustration + message inside the table body

### Modal (FormModal / ConfirmModal)

- Backdrop: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- Panel: `bg-white rounded-2xl shadow-xl w-full max-w-md mx-4`
- Header: `px-6 py-4 border-b border-gray-100`
- Body: `px-6 py-4 space-y-4`
- Footer: `flex justify-end gap-3` inline in the body (no separate footer bar)

### PageHeader

```
flex items-start justify-between mb-6
left: h1 (title, text-2xl font-bold text-gray-900) + p (subtitle, text-gray-500)
right: action button(s)
```

### Breadcrumb

```
text-sm text-gray-500
Clientes > [link] Nombre cliente > [current] Nombre instalación
separator: / or ChevronRight icon
```

---

## Naming Conventions

| Domain term | UI label | Backend entity |
|-------------|----------|----------------|
| Cliente | Clientes | Organization |
| Instalación | Instalaciones / Locación | Location |
| Operador | Operadores | User (role: OPERATOR) |
| Terminal | Terminales | Terminal |
| Tarifa | Tarifas | Tariff |

> The word "Organización" must not appear in the UI. Use "Cliente" and "Instalación" instead.

---

## File Conventions

```
src/
  components/         # Shared UI: Sidebar, Layout, DataTable, FormModal, ConfirmModal, Badge, PageHeader
  pages/
    clients/          # Renamed from organizations/ — the only top-level nav view today
      ClientsPage.tsx
      ClientDetailPage.tsx
      ClientFormModal.tsx
      LocationDetailPage.tsx
    locations/        # LocationFormModal only — used inside the Clientes flow, no top-level page
    terminals/        # TerminalFormModal only — used inside the Clientes flow, no top-level page
    tariffs/          # TariffFormModal only — used inside the Clientes flow, no top-level page
    auth/
  api/
    organizations.ts, locations.ts, terminals.ts, tariffs.ts, users.ts
    # All API modules are kept even for removed pages (dashboard/users/organizations top-level,
    # locations/terminals/tariffs top-level) so those views can be restored later without
    # rebuilding the data layer.
  types/
    index.ts          # Organization type stays; add Client alias if needed
```

---

## Accessibility

- All interactive elements have visible focus rings: `focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2`
- Modals trap focus and close on Escape
- Nav links have `aria-current="page"` when active (React Router NavLink handles this)
- Icons used as standalone controls must have `aria-label`

---

## What NOT to do

- Do not use inline styles; use Tailwind classes only.
- Do not use `text-black` or `bg-white` for the main content background — use the `gray-*` palette.
- Do not use `bg-gray-900`/black for primary CTAs — primary is always `bg-brand-600`.
- Do not add heavy card shadows (`shadow-lg`, `shadow-xl`) outside of modals and dropdowns.
- Do not add emoji to UI labels.
- Do not hardcode widths in px except for the sidebar (`w-12` / `w-52`).
- Do not show "Organizaciones" anywhere in the UI — always use "Clientes".
- Do not invent a new blue/green for buttons or badges — use the `brand-*` / `success-*` tokens so web stays visually consistent with the mobile app.
