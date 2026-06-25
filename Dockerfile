FROM node:20-alpine AS builder
WORKDIR /app

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BASE_URL_API
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_BASE_URL_API=${NEXT_PUBLIC_BASE_URL_API}

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    && rm -rf /var/cache/apk/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN npm install -g tsx

RUN addgroup --system --gid 1001 appuser
RUN adduser --system --uid 1001 appuser

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json server.js ./
COPY --from=builder /app/lib ./lib
COPY --from=builder /app/src ./src

RUN mkdir -p /app/uploads /app/logs /app/.wwebjs_auth && \
    chown -R appuser:appuser /app/uploads /app/logs /app/.wwebjs_auth

USER appuser

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v2/health || exit 1

EXPOSE 3000

ENV NODE_ENV=production
CMD ["tsx", "server.js"]
