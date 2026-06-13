# Nexus CRM

A modern, freelance-focused CRM inspired by HubSpot and Attio. Built with React, TypeScript, Vite, Tailwind CSS v4, and Recharts.

## Modules (V1)

- **Dashboard** — pipeline overview, monthly revenue/margin, prospecting performance, today's tasks, recent devis.
- **Contacts** — leads/prospects/clients database with source tracking (LGM, Instantly, Referral, Website, LinkedIn...).
- **Companies** — company database linked to contacts, deals, devis and websites.
- **Deals** — drag & drop pipeline (Kanban) across stages from New to Won/Lost, with value, probability and cost.
- **Devis** — quote builder with line items, VAT, totals, status tracking, and a print/PDF-ready preview.
- **Calendar & Tasks** — month calendar with tasks (calls, emails, meetings, todos), priorities and quick toggling.
- **Prospection (LGM/Instantly)** — campaign tracking with funnel charts (sent → opened → replied → positive → meetings).
- **Workflows** — simple automation builder (triggers + steps: wait, email, task, tag, stage change).
- **Reports & Profitability** — revenue/cost/margin by month, win rate, revenue by source, per-deal profitability.
- **Websites** — performance overview (visitors, conversion rate, load time, uptime) for your Bolt site and client sites.
- **Settings** — profile, data export/import (JSON), and placeholders for Supabase/LGM/Instantly/Bolt webhook integrations.

## Data layer

All data currently lives in `localStorage` (seeded with realistic sample data on first run) via `src/lib/storage.ts` and `src/lib/data.ts`. The hooks (`useContacts`, `useDeals`, etc.) are designed so the underlying implementation can be swapped for Supabase later without changing call sites.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
