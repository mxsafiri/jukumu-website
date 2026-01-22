# Contributors Guide

## Purpose
This guide helps developers and future contributors understand how to work on the JUKUMU Fund platform safely and consistently.

## Tech stack (current)
- Next.js (App Router)
- React + TypeScript
- PostgreSQL
- `pg` for database access

## Local development
1. Install dependencies
   - `npm install`

2. Configure environment variables
   - Create `.env.local` and set the required variables.

3. Set up the database
   - Create a Postgres database
   - Apply `database/schema.sql`

4. Run the dev server
   - `npm run dev`

## Environment variables (names only)
Exact values should never be committed.
- `DATABASE_URL`
- `JWT_SECRET`
- Any wallet/provider secrets used by the group wallet integration

## Data model
- The source of truth for schema is `database/schema.sql`.
- When adding new features:
  - Update `database/schema.sql` for fresh setups
  - Ensure API routes are resilient when tables/columns may be missing on older deployments (graceful checks)

## Project structure
- `src/app/` — Next.js pages and API routes
- `src/lib/` — shared utilities (auth, db, helpers)
- `src/components/` — reusable UI
- `database/` — schema and DB scripts

## API patterns
- APIs should enforce authentication and authorization.
- Group-scoped endpoints should validate that the requesting user is a group member.
- Leadership-only actions should check the user’s group role.

## Security & operational expectations
- Never log secrets.
- Avoid committing `.env*` files.
- Prefer explicit validation and consistent error responses.
- Favor minimal permissions (least privilege).

## Deployments
- Configure required environment variables in the hosting provider.
- Run smoke tests after deploy:
  - Login
  - Group pages
  - Proposals/voting
  - Wallet summary (if enabled)

