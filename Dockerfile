FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

ARG AIRTABLE_API_KEY
ARG BASE_ID
ARG JOBS_TABLE
ARG JOB_CATEGORIES_TABLE
ARG JOB_TYPES_TABLE
ARG LOCATIONS_TABLE
ARG NEXT_PUBLIC_SITE_URL
ARG PRODUCT_GROUPS_TABLE
ARG SUBSCRIBERS_TABLE

ENV AIRTABLE_API_KEY=$AIRTABLE_API_KEY
ENV BASE_ID=$BASE_ID
ENV JOBS_TABLE=$JOBS_TABLE
ENV JOB_CATEGORIES_TABLE=$JOB_CATEGORIES_TABLE
ENV JOB_TYPES_TABLE=$JOB_TYPES_TABLE
ENV LOCATIONS_TABLE=$LOCATIONS_TABLE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV PRODUCT_GROUPS_TABLE=$PRODUCT_GROUPS_TABLE
ENV SUBSCRIBERS_TABLE=$SUBSCRIBERS_TABLE

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

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

CMD ["sh", "-c", "\
  TOKEN=$(infisical login \
    --method=universal-auth \
    --client-id=$INFISICAL_CLIENT_ID \
    --client-secret=$INFISICAL_CLIENT_SECRET \
    --domain=https://secrets.vinhpham.com.vn \
    --plain --silent) && \
  infisical run \
    --token=$TOKEN \
    --projectId=$INFISICAL_PROJECT_ID \
    --env=$INFISICAL_ENV \
    --domain=https://secrets.vinhpham.com.vn \
    -- node server.js"]