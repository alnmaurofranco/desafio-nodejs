import type { users } from '../database/schema.ts'

import '@fastify/jwt'

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      role: (typeof users.$inferSelect)['role']
      sub: string
    }
  }
}
