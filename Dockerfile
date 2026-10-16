# ChainDepo frontend (Next.js 14), production image
# Build:
#   docker build \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.<domain>/graphql \
#     --build-arg NEXT_PUBLIC_API_WS=wss://api.<domain> \
#     -t chaindepo-next .
# Run:
#   docker run -p 3000:3000 chaindepo-next

# 1. all dependencies (needed for next build)
FROM node:20-slim AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

# 2. production dependencies only (for next start)
FROM node:20-slim AS prod-deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production --network-timeout 600000 && yarn cache clean

# 3. build
FROM node:20-slim AS builder
WORKDIR /app
# NEXT_PUBLIC_* values are inlined into the client bundle, so they must be set at build time
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_API_WS
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
	NEXT_PUBLIC_API_WS=$NEXT_PUBLIC_API_WS \
	NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

# 4. runtime
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production \
	NEXT_TELEMETRY_DISABLED=1 \
	PORT=3000
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/next.config.js ./next.config.js
COPY --from=builder --chown=node:node /app/next-i18next.config.js ./next-i18next.config.js
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next ./.next
USER node
EXPOSE 3000
CMD ["yarn", "start", "-p", "3000"]
