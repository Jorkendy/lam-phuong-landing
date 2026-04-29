FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Build args — truyền vào từ Coolify
ARG AIRTABLE_API_KEY
ARG BASE_ID
ARG JOBS_TABLE
ARG JOB_CATEGORIES_TABLE
ARG JOB_TYPES_TABLE
ARG LOCATIONS_TABLE
ARG NEXT_PUBLIC_SITE_URL
ARG PRODUCT_GROUPS_TABLE
ARG SUBSCRIBERS_TABLE

# Set thành ENV để Next.js đọc được lúc build
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

# Cài Infisical CLI
RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --