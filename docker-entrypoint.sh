#!/bin/sh
set -e

echo "▶ Waiting for database..."
for i in 1 2 3 4 5 6 7 8 9 10; do
  if echo "SELECT 1" | npx prisma db execute --stdin 2>/dev/null; then
    echo "▶ Database ready"
    break
  fi
  if [ "$i" = "10" ]; then
    echo "▶ Database not ready after 10 retries"
    exit 1
  fi
  echo "  Retry $i/10..."
  sleep 2
done

echo "▶ Syncing schema..."
npx prisma db push --accept-data-loss

echo "▶ Seeding..."
npm run db:seed

echo "▶ Starting app..."
exec npm start
