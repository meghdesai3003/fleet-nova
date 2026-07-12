# TransitOps

A transport operations platform built for an 8-hour hackathon. Replaces spreadsheets for tracking vehicles, drivers, trips, maintenance, and expenses.

## Stack

- Frontend: React (Vite) + Tailwind
- Backend: Node + Express
- Database: flat JSON files (server/src/data)
- Auth: JWT + role-based access

## Roles

Fleet Manager, Driver, Safety Officer, Financial Analyst.

## Core features

- Login with RBAC
- Vehicle registry (Available / On Trip / In Shop / Retired)
- Driver management (license, safety score, status)
- Trip lifecycle: Draft → Dispatched → Completed / Cancelled
- Maintenance logging (auto-updates vehicle status)
- Fuel & expense tracking
- Dashboard with fleet KPIs
- Reports: fuel efficiency, utilization, cost, ROI