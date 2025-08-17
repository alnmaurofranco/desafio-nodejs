import { verify } from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../database/client.ts'
import { users } from '../database/schema.ts'

// biome-ignore lint/suspicious/useAwait: <>
export const authenticateWithPasswordRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/sessions/password',
    {
      schema: {
        tags: ['Authentication'],
        summary: 'Autenticar com e-mail e senha',
        description: 'Autentique-se com e-mail e senha para obter um token de autenticação',
        operationId: 'authenticateWithPassword',
        body: z.object({
          email: z.email(),
          password: z.string().min(6, 'Senha precisa de pelo menos 6 caracteres'),
        }),
        response: {
          200: z
            .object({
              accessToken: z.jwt(),
            })
            .describe('Retorna um token de acesso'),
          401: z
            .object({
              message: z.string(),
            })
            .describe('Retorna uma mensagem de erro'),
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const result = await db.select().from(users).where(eq(users.email, email))

      if (result.length === 0) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }
      const user = result[0]

      const doesPasswordMatch = await verify(user.password, password)

      if (!doesPasswordMatch) {
        return reply.status(401).send({ message: 'Credenciais inválidas' })
      }

      const accessToken = await reply.jwtSign(
        {
          role: user.role,
        },
        {
          sign: {
            sub: user.id,
          },
        },
      )

      return reply.status(200).send({ accessToken })
    },
  )
}
