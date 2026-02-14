# Contributing to iNeedATruck

Thanks for your interest in contributing. This guide covers how to get set up and submit changes.

## Prerequisites

- **Node.js** 22+ (or use the Docker setup)
- **Docker** and **Docker Compose** (recommended)
- **Git**

## Getting started

```bash
git clone git@github.com:tylerzwol/iNeedATruck.git
cd iNeedATruck
docker compose -f docker-compose.dev.yml up
```

When you see "Ready" in the logs, open [http://localhost:3000](http://localhost:3000).

This single command starts Postgres, syncs the schema, seeds demo data, and runs the Next.js dev server with hot reload.

### Local dev (without Docker)

```bash
cp .env.example .env
npm install
npx prisma generate
# Start Postgres separately (e.g. docker compose up postgres -d)
npx prisma db push
npm run db:seed
npm run dev
```

## Project structure

| Path | Purpose |
|------|---------|
| `src/app/` | Next.js App Router pages and API routes |
| `src/components/` | Shared UI components |
| `src/lib/` | Prisma client, constants, validations |
| `src/generated/` | Prisma client output (do not edit) |
| `prisma/schema.prisma` | Database schema |
| `prisma/seed.ts` | Demo data |

## Key conventions

### Constants

Service types, vehicle types, and shared config live in `src/lib/constants.ts`. Use these instead of hardcoding values.

### Prisma Decimal fields

Prisma `Decimal` types cannot be passed from Server Components to Client Components. Convert to numbers before passing:

```ts
// Server Component → Client Component
const ownerForForm = {
  ...owner,
  pricingProfile: owner.pricingProfile
    ? {
        hourlyRate: Number(owner.pricingProfile.hourlyRate),
        minimumJobPrice: Number(owner.pricingProfile.minimumJobPrice),
        perMileRate: owner.pricingProfile.perMileRate ? Number(owner.pricingProfile.perMileRate) : null,
      }
    : null,
};
```

### Database changes

1. Edit `prisma/schema.prisma`
2. Run `npx prisma db push` (dev) or `npx prisma migrate dev` (for migrations)
3. Run `npm run db:generate` if needed
4. Update `prisma/seed.ts` if adding new models or fields

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:dev` | Docker compose dev (hot reload) |
| `npm run fresh` | Full reset: stop containers, remove volumes & caches, start fresh |

## Submitting changes

1. **Fork** the repo and create a branch from `main`
2. **Make your changes** with clear, focused commits
3. **Run** `npm run lint` before submitting
4. **Open a Pull Request** with a description of what changed and why

## Questions?

Open an issue or reach out to the maintainers.
