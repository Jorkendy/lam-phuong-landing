FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Cài Infisical CLI
RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

# Inject secrets từ Infisical lúc runtime
CMD ["sh", "-c", "infisical run \
  --projectId=$INFISICAL_PROJECT_ID \
  --env=$INFISICAL_ENV \
  --client-id=$INFISICAL_CLIENT_ID \
  --client-secret=$INFISICAL_CLIENT_SECRET \
  -- node server.js"]