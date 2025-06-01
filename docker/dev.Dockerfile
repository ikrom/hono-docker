# Development Dockerfile
FROM oven/bun:1.2.15-alpine
WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Start development server with hot reload
CMD ["bun", "--hot", "src/index.ts"]