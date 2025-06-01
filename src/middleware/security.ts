import { MiddlewareHandler } from 'hono'
import { cors } from 'hono/cors'
import { secureHeaders } from 'hono/secure-headers'

export const corsMiddleware = cors({
  origin: process.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
})

export const securityHeaders: MiddlewareHandler = secureHeaders({
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'no-referrer',
  strictTransportSecurity: 'max-age=31536000; includeSubDomains',
})

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  // Simple in-memory rate limiting
  // TODO: Replace with Redis-based implementation for production
  const ip = c.req.header('x-forwarded-for') || 'unknown'
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxRequests = 100 // max 100 requests per windowMs

  const requests = rateLimit.get(ip) || []
  const recentRequests = requests.filter(time => time > now - windowMs)

  if (recentRequests.length >= maxRequests) {
    return c.text('Too many requests', 429)
  }

  recentRequests.push(now)
  rateLimit.set(ip, recentRequests)

  await next()
}

// Simple in-memory store - replace with Redis in production
const rateLimit = new Map<string, number[]>()