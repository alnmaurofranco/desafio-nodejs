import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../database/client.ts'
import { courses } from '../database/schema.ts'
import { checkRequestJWT } from './hooks/check-request-jwt.ts'
import { checkUserRole } from './hooks/check-user-role.ts'

// biome-ignore lint/suspicious/useAwait: <>
export const getCourseByIdRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/courses/:id',
    {
      preHandler: [checkRequestJWT, checkUserRole()],
      schema: {
        tags: ['Courses'],
        summary: 'Detalhes de um curso',
        description: 'Retorna os detalhes de um curso',
        operationId: 'getCourseById',
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            course: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const courseId = id

      const result = await db.select().from(courses).where(eq(courses.id, courseId))

      if (result.length > 0) {
        return reply.status(200).send({ course: result[0] })
      }

      return reply.status(404).send({ message: 'Curso não encontrado' })
    },
  )
}
