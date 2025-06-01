# Stage 1: Build
FROM oven/bun:1.2.15-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application with production environment
RUN NODE_ENV=production bun build src/index.ts --outdir=dist

# Stage 2: Runtime
FROM oven/bun:1.2.15-alpine
WORKDIR /app

# Copy built app and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./

# Install only production dependencies
RUN bun install --frozen-lockfile --production

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["bun", "run", "dist/index.js"]
