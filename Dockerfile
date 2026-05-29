FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app

# Thông tin đăng nhập Infisical (chỉ dùng lúc build) để kéo secret từ self-host A.
# generateStaticParams() + sitemap.ts fetch Airtable ở build-time nên build cần đủ secret.
ARG INFISICAL_CLIENT_ID
ARG INFISICAL_CLIENT_SECRET
ARG INFISICAL_PROJECT_ID
ARG INFISICAL_ENV
# Service token của Cloudflare Access để CLI đi qua được Access (KHÔNG dùng OTP cho máy).
# Định dạng: "CF-Access-Client-Id=<id> CF-Access-Client-Secret=<secret>"
ARG INFISICAL_CUSTOM_HEADERS
ENV INFISICAL_CUSTOM_HEADERS=$INFISICAL_CUSTOM_HEADERS

# Network fix khi gọi api.airtable.com bằng fetch() (undici):
#  - --no-network-family-autoselection: tắt Happy Eyeballs của Node 20 (bật mặc định),
#    vốn đua kết nối tới cả 5 IPv4 + 5 IPv6 của Airtable rồi treo -> ETIMEDOUT trong
#    môi trường Docker/host không định tuyến IPv6. (curl không dính vì tự xử lý riêng.)
#  - --dns-result-order=ipv4first: ưu tiên IPv4 cho chắc.
ENV NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection"

# Cài Infisical CLI cho stage build
RUN apk add --no-cache bash curl && \
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.alpine.sh' | bash && \
    apk add --no-cache infisical

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && \
    TOKEN=$(infisical login \
      --method=universal-auth \
      --client-id=$INFISICAL_CLIENT_ID \
      --client-secret=$INFISICAL_CLIENT_SECRET \
      --domain=https://secrets2.vinhpham.com.vn \
      --plain --silent) && \
    infisical run \
      --token=$TOKEN \
      --projectId=$INFISICAL_PROJECT_ID \
      --env=$INFISICAL_ENV \
      --domain=https://secrets2.vinhpham.com.vn \
      -- pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
# Cùng network fix như builder: runtime SSR/route handler cũng fetch() Airtable.
ENV NODE_OPTIONS="--dns-result-order=ipv4first --no-network-family-autoselection"

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
    --domain=https://secrets2.vinhpham.com.vn \
    --plain --silent) && \
  infisical run \
    --token=$TOKEN \
    --projectId=$INFISICAL_PROJECT_ID \
    --env=$INFISICAL_ENV \
    --domain=https://secrets2.vinhpham.com.vn \
    -- node server.js"]