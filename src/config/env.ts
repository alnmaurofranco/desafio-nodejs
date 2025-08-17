import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.url().startsWith('postgresql://'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5555),
})

if (!envSchema.safeParse(process.env).success) {
  const error = envSchema.safeParse(process.env).error
  throw new Error(`Invalid environment variables: ${error}`)
}

export const env = envSchema.parse(process.env)
