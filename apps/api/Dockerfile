FROM node:20-alpine

# Install libc6-compat for general compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy monorepo root configurations
COPY package*.json tsconfig.json turbo.json ./

# Copy package descriptors for workspaces
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all workspace dependencies cleanly
RUN npm ci

# Copy package source directories
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Change working directory to the API workspace
WORKDIR /app/apps/api

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

# Start Express API using tsx loader for seamless ESM + TS workspace resolution
CMD ["npx", "tsx", "src/index.ts"]
