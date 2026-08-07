#!/bin/sh
set -e

npx prisma migrate deploy

if [ "$SEED_ON_BOOT" = "true" ]; then
  npx prisma db seed || true
fi

exec npx next start -H 0.0.0.0 -p 3000
