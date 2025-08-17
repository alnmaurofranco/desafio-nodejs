import { drizzle } from 'drizzle-orm/node-postgres'
import { env } from '../config/env.ts'

if (!process.env.DATABASE_URL) {
  throw new Error('The DATABASE_URL environment variable is not defined')
}

export const db = drizzle(process.env.DATABASE_URL, {
  logger: env.NODE_ENV === 'development',
})
