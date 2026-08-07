FROM node:22-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
# Build only — do NOT use `npm run build` here: that script also runs
# `prisma migrate deploy`, which needs a real DATABASE_URL and belongs at
# container start (see docker-entrypoint.sh), not at image build time.
RUN npx next build

# Safe to switch to production mode now that install/build are done; this
# only affects the app's runtime behavior (next start), not npm itself.
ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && chmod +x /app/docker-entrypoint.sh \
  && chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/app/docker-entrypoint.sh"]
