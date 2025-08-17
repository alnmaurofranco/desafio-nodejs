import type { FastifyReply, FastifyRequest } from 'fastify'

export async function checkRequestJWT(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify({
      algorithms: ['RS256'],
    })
  } catch {
    throw reply.status(401).send()
  }
}
