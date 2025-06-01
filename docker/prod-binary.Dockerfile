# Stage 1: Build
FROM oven/bun:1.2.15-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build binary
RUN bun run build:bin

# Stage 2: Runtime
FROM alpine:3.18
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy binary and make it executable
COPY --from=builder /app/server ./server
RUN chmod +x ./server

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE ${PORT:-3001}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the binary
CMD ["./server"]
