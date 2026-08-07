FROM node:22-bookworm-slim

WORKDIR /app

# Fallback toolchain in case better-sqlite3 has no prebuilt binary for this
# platform/Node ABI and needs to compile from source during npm ci.
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

# NODE_ENV must NOT be "production" yet: npm ci treats that as --omit=dev
# and would skip devDependencies (tsx, typescript, tailwindcss) that the
# build step and the runtime seed command both need.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Safe to switch to production mode now that install/build are done; this
# only affects the app's runtime behavior (next start), not npm itself.
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/prisma/data \
  && chmod +x /app/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
