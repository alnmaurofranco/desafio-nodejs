import type { FastifyReply, FastifyRequest } from 'fastify'
import type { users } from '../../database/schema.ts'

export function checkUserRole(role?: (typeof users.$inferSelect)['role']) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { role: userRole } = request.user

    if (role && userRole !== role) {
      return reply.status(401).send()
    }
  }
}
