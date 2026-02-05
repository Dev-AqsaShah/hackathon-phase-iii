/**
 * Better Auth configuration for user authentication.
 * Handles signup, login, and session management with JWT tokens.
 */

import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";
import { Pool } from "pg";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is required");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create PostgreSQL connection pool for Better Auth
// SSL is configured via sslmode=require in the connection string
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,

  // Database configuration using pg Pool
  database: pool,

  // Email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production
  },

  // Session configuration with JWT and secure cookie options
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieOptions: {
      httpOnly: true, // Prevent JavaScript access (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: "lax", // CSRF protection
    },
  },

  // Cookie configuration
  advanced: {
    cookiePrefix: "todo-app",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    // Disable JWKS encryption to avoid issues when secret changes
    disablePrivateKeyEncryption: true,
  },

  // Use Next.js cookies adapter and JWT plugin for backend API authentication
  plugins: [
    nextCookies(),
    jwt(),
  ],
});
