FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .

# Build-time env vars per il next build
ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET
ARG CSRF_SECRET
ENV CSRF_SECRET=$CSRF_SECRET
ARG JWT_ACCESS_SECRET
ENV JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
ARG JWT_REFRESH_SECRET
ENV JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
ARG MONGODB_URI
ENV MONGODB_URI=$MONGODB_URI
ARG COOKIE_SECRET
ENV COOKIE_SECRET=$COOKIE_SECRET

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
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

EXPOSE 3000

ENV NODE_ENV=production
CMD ["node", "server.js"]
