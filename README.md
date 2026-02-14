# iNeedATruck

Connect local truck owners with customers. Platform fee per job, seasonal offerings, premium memberships.

## Tech stack

Next.js 16 · PostgreSQL 16 · Prisma 7 · Tailwind CSS 4 · Docker

## Quick start

```bash
git clone git@github.com:tylerzwol/iNeedATruck.git
cd iNeedATruck
docker compose -f docker-compose.dev.yml up
```

When you see "Ready" in the logs: **[http://localhost:3000](http://localhost:3000)**

Postgres: `localhost:5433` (user: postgres, password: postgres, db: ineedatruck)

## Features

- **List your truck** – Onboarding: identity, vehicle, services, pricing, availability
- **Find a truck** – Browse verified truck owners, filter by service
- **Request a job** – Book hauls, moves, plowing, yard work
- **Seasonal offers** – Winter plow specials, spring yard hauls
- **Admin** – Manage truck owners, jobs, offers

## Docs

- [CONTRIBUTING.md](./CONTRIBUTING.md) – Setup, project structure, scripts, conventions
- [PROJECT_STATUS.md](./PROJECT_STATUS.md) – Tradeoffs, limitations, roadmap
