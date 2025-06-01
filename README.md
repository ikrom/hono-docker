# Hono Docker API

A modern API example built with Hono.js and Docker, featuring versioned endpoints, comprehensive testing, and production-ready configurations.

## Features

- 🚀 **Versioned API**: V1 and V2 endpoints with backward compatibility
- 🔐 **CORS Support**: Configurable CORS with multiple origin support
- 🧪 **Test Coverage**: Comprehensive unit tests for all endpoints
- 🐳 **Docker Ready**: Development and production Docker configurations
- 🔄 **Hot Reload**: Fast development with Bun's hot reload
- 🏗️ **Clean Architecture**: Modular route structure and middleware
- 🔍 **API Documentation**: Built-in OpenAPI documentation endpoint
- ⚡ **Powered by Bun**: High-performance JavaScript/TypeScript runtime

## API Versions

### V1 (Stable)
- Basic CRUD operations
- Simple validation
- Basic health checks
- Standard error responses

### V2 (Latest)
- Enhanced validation
- Extended user profiles
- Pagination and search
- Batch operations
- Detailed error responses
- Advanced health metrics

## Project Structure

```
src/
├── middleware/       # Global middleware
├── routes/          # API routes
│   ├── v1/         # Version 1 routes
│   │   ├── health/ # Health check endpoints
│   │   ├── users/  # User management
│   │   └── __tests__/
│   └── v2/         # Version 2 routes
│       ├── health/ # Enhanced health endpoints
│       ├── users/  # Extended user features
│       └── __tests__/
├── index.ts        # Application entry
└── index.test.ts   # Main test suite
```

## Quick Start

1. Install dependencies:
```bash
bun install
```

2. Set up environment:
```bash
cp .env.example .env.dev
```

3. Start development server:
```bash
bun run dev
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origins (comma-separated or *)

## Available Scripts

- `bun run dev`: Start development server
- `bun run build`: Build for production
- `bun run start`: Start production server
- `bun test`: Run test suite
- `bun test:watch`: Run tests in watch mode

## API Documentation

Access API documentation at `/docs` endpoint. Features include:
- OpenAPI 3.0 specification
- Endpoint descriptions
- Request/response examples
- Version-specific documentation

## Testing

The project includes comprehensive tests for:
- Route functionality
- Error handling
- CORS configuration
- Environment-specific behavior
- API versioning

Run tests with:
```bash
bun test
```

## Docker Support

Development:
```bash
docker compose up dev
```

Production:
```bash
docker compose up prod
```

## CORS Configuration

Configure CORS in multiple ways:
- Single origin: `CORS_ORIGIN=https://example.com`
- Multiple origins: `CORS_ORIGIN=https://app1.com,https://app2.com`
- All origins: `CORS_ORIGIN=*`

## Health Checks

V1 (`/v1/health`):
```json
{
  "status": "ok",
  "version": "v1",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

V2 (`/v2/health`):
```json
{
  "status": "ok",
  "version": "v2",
  "timestamp": "2024-01-01T00:00:00Z",
  "system": {
    "memory": {...},
    "uptime": 123
  }
}
```

## Error Handling

Standard error response format:
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "type": "ErrorType",
    "details": "Additional info (dev only)"
  }
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## License

MIT License