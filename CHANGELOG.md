# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

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
