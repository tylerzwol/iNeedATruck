# iNeedATruck

Connect local truck owners with customers. Platform fee per job, seasonal offerings, premium memberships.

## Tech stack

- **Next.js 16** – Frontend + API
- **PostgreSQL 16** – Database
- **Prisma 7** – ORM with pg adapter
- **Tailwind CSS 4** – Styling
- **Docker** – Postgres + App containers

## Quick start

```bash
git clone <your-repo-url>
cd iNeedATruck
docker compose -f docker-compose.dev.yml up
```

This starts Postgres, runs schema sync, seeds demo data, and starts the app with hot reload. When you see "Ready" in the logs:

**[http://localhost:3000](http://localhost:3000)**

Postgres: `localhost:5433` (user: postgres, password: postgres, db: ineedatruck)

## Features

- **List your truck** – 5-step onboarding: identity, vehicle, services, pricing, availability
- **Find a truck** – Browse verified truck owners, view rates and equipment
- **Request a job** – Book hauls, moves, plowing, yard work (service types from truck owner)
- **Seasonal offers** – Winter plow specials, spring yard hauls
- **Admin** – Manage truck owners (verify, edit), jobs, offers
- **Platform fee** – Configurable % per job; premium members get lower fees

### Truck onboarding (MVP spec)

- **Identity & trust:** full name, email, phone, profile photo, service radius or zip codes, bio, license/insurance/background check
- **Vehicle:** type, bed length, payload, towing, AWD/4WD, equipment (ramps, straps, plow, etc.)
- **Services:** 12 service types with seasonal tags (winter, spring, summer, fall, all)
- **Pricing:** hourly rate, minimum job price, per-mile rate, emergency surcharge
- **Availability:** always/weekends/after 5pm/custom, seasonal availability, same-day jobs

## Project structure

```
src/
  app/           # Next.js app router (pages, API routes)
  components/    # Shared UI
  lib/           # Prisma client, validations
  generated/     # Prisma client (generated)
prisma/
  schema.prisma  # Database schema
  seed.ts        # Demo data
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Docker compose up |
| `npm run docker:dev` | Docker compose dev (hot reload) |
