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

The visual style mirrors **shadcn/ui** principles: clean, minimal, high-contrast text on neutral backgrounds, generous whitespace, subtle borders instead of heavy shadows.

### Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `brand-50` | `#eff6ff` | Light tints, hover backgrounds |
| `brand-100` | `#dbeafe` | Badge backgrounds |
| `brand-500` | `#3b82f6` | Interactive elements |
| `brand-600` | `#2563eb` | Primary actions, active nav, CTA buttons |
| `brand-700` | `#1d4ed8` | Button hover states |
| `brand-800` | `#1e40af` | Dark accents |
| `brand-900` | `#1e3a8a` | Role badge backgrounds on dark sidebar |
| `slate-50` | Tailwind default | Page background |
| `slate-700` | Tailwind default | Sidebar dividers, avatar bg |
| `slate-800` | Tailwind default | Sidebar hover states |
| `slate-900` | Tailwind default | Sidebar background |

### Typography

- Font: system-ui (browser default — no custom font loaded)
- Base size: `text-sm` (14px) for body and nav
- Page titles: `text-2xl font-bold text-slate-900`
- Section labels: `text-xs font-semibold uppercase text-slate-500 tracking-wider`
- Table headers: `text-xs font-semibold uppercase text-slate-500`

### Spacing & Radius

- Card/panel padding: `p-6`
- Input/button radius: `rounded-lg` (8px)
- Sidebar nav item radius: `rounded-lg`
- Table row: no radius, full-width
- Modal: `rounded-xl`

### Elevation

Avoid heavy `box-shadow`. Use `border border-slate-200` for panels. Modals get `shadow-xl`.

---

## Layout

```
┌──────────────────────────────────────────────────────────┐
│  Sidebar (collapsible)  │  Main content area             │
│  w-64 (expanded)        │  flex-1, overflow-y-auto       │
│  w-16 (collapsed)       │  p-6 or p-8                    │
└──────────────────────────────────────────────────────────┘
```

The `Layout` component (`src/components/Layout.tsx`) renders `<Sidebar />` + `<Outlet />`.

---

## Sidebar — Collapsible

### Behavior

- **Expanded** (`w-64`): Shows icon + label for each nav item. Logo + app name visible.
- **Collapsed** (`w-16`): Shows icon only. Logo shrinks to icon only. Labels hidden. Tooltip on hover shows the label.
- State stored in `localStorage` key `sidebar-collapsed` so it persists across refreshes.
- Toggle button: chevron icon at the bottom of the nav, or at the top-right edge of the sidebar.

### Anatomy (expanded)

```
┌─────────────────────┐
│  [P]  Parking App   │  ← Logo + name (hidden when collapsed)
│       Dashboard     │
├─────────────────────┤
│  ⊞  Dashboard       │
│  👥  Usuarios       │
│  🏢  Clientes       │
│  📍  Locaciones     │
│  🖥  Terminales      │
│  💲  Tarifas        │
├─────────────────────┤
│  [avatar] Nombre    │  ← User info (avatar only when collapsed)
│           ADMIN     │
│  ↩  Cerrar sesión   │
└─────────────────────┘
```

### Anatomy (collapsed, w-16)

```
┌────┐
│ P  │  ← Logo only
├────┤
│ ⊞  │
│ 👥 │
│ 🏢 │
│ 📍 │
│ 🖥  │
│ 💲 │
├────┤
│ av │  ← Avatar only
│ ↩  │
└────┘
```

### Transition

Use `transition-all duration-200 ease-in-out` on the sidebar width. Icon stays centered; label fades out with `opacity-0 w-0 overflow-hidden` when collapsed.

### Active state

Active nav item: `bg-brand-600 text-white`. Hover: `hover:bg-slate-800 hover:text-white text-slate-300`.

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
| LayoutDashboard | Dashboard | `/dashboard` | All roles |
| Users | Usuarios | `/users` | ADMIN only |
| Building2 | Clientes | `/clients` | ADMIN only |
| MapPin | Locaciones | `/locations` | ADMIN, CUSTOMER |
| Monitor | Terminales | `/terminals` | ADMIN, CUSTOMER |
| CircleDollarSign | Tarifas | `/tarifas` | ADMIN, CUSTOMER |

> **Note:** "Organizaciones" is renamed to **"Clientes"** everywhere in the UI. The route changes from `/organizations` to `/clients`. The underlying API entity remains `Organization`.

---

## Page Patterns

### List page (e.g., Clientes, Usuarios, Locaciones)

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

Tabs:
  [Instalaciones]  [Info]

Tab — Instalaciones:
  DataTable of locations belonging to this org
  Row click → /clients/:id/locations/:locationId
  Action: + Nueva instalación
```

### Detail page — Instalación (`/clients/:clientId/locations/:locationId`)

```
Breadcrumb: Clientes > Nombre cliente > Nombre instalación

PageHeader
  title: locationName
  subtitle: address, city · capacity spots
  badge: status
  action: Editar instalación

Tabs:
  [Operadores]  [Terminales]  [Tarifas]  [Info]

Tab — Operadores:
  Users with role=OPERATOR and locationId=this location
  Actions: Asignar operador, Desactivar

Tab — Terminales:
  Terminals assigned to this location
  Columns: serial, model, status, last heartbeat
  Actions: + Agregar terminal

Tab — Tarifas:
  Tariffs for this location
  Columns: name, vehicleType, pricePerHour, validFrom, active
  Actions: + Nueva tarifa
```

---

## Component Patterns

### Button variants

| Variant | Classes | Usage |
|---------|---------|-------|
| Primary | `bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium` | Main CTA |
| Secondary | `border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium` | Cancel, secondary actions |
| Destructive | `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium` | Delete, disable |
| Ghost | `text-slate-600 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-sm` | Table row actions |

### Status Badge

```tsx
// Active → green; Inactive → slate; Online → green; Offline → red; Maintenance → amber
<span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
  bg-green-50 text-green-700 border border-green-200">
  ACTIVE
</span>
```

### DataTable

- Full-width, `divide-y divide-slate-100`
- Header: `bg-slate-50 text-xs font-semibold uppercase text-slate-500 px-4 py-3`
- Row: `px-4 py-3 text-sm text-slate-700 hover:bg-slate-50`
- Empty state: centered illustration + message inside the table body

### Modal (FormModal / ConfirmModal)

- Backdrop: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- Panel: `bg-white rounded-xl shadow-xl w-full max-w-md mx-4`
- Header: `px-6 py-5 border-b border-slate-100`
- Body: `px-6 py-5 space-y-4`
- Footer: `px-6 py-4 border-t border-slate-100 flex justify-end gap-3`

### PageHeader

```
flex items-start justify-between mb-6
left: h1 (title) + p (subtitle)
right: action button(s)
```

### Breadcrumb

```
text-sm text-slate-500
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
  components/         # Shared UI: Sidebar, Layout, DataTable, Modal, Badge, PageHeader
  pages/
    clients/          # Renamed from organizations/
      ClientsPage.tsx
      ClientDetailPage.tsx
      ClientFormModal.tsx
    locations/        # Kept as top-level admin view
    users/
    dashboard/
    auth/
  api/
    clients.ts        # Renamed from organizations.ts (re-exports same API)
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
- Do not use `text-black` or `bg-white` for the main content background — use `slate-*` palette.
- Do not add heavy card shadows (`shadow-lg`, `shadow-xl`) outside of modals and dropdowns.
- Do not add emoji to UI labels.
- Do not hardcode widths in px except for the sidebar (w-64 / w-16).
- Do not show "Organizaciones" anywhere in the UI — always use "Clientes".
