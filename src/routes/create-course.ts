import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../database/client.ts'
import { courses } from '../database/schema.ts'
import { checkRequestJWT } from './hooks/check-request-jwt.ts'
import { checkUserRole } from './hooks/check-user-role.ts'

// biome-ignore lint/suspicious/useAwait: <>
export const createCourseRoute: FastifyPluginAsyncZod = async app => {
  app.post(
    '/courses',
    {
      preHandler: [checkRequestJWT, checkUserRole('MANAGER')],
      schema: {
        tags: ['Courses'],
        summary: 'Criar um curso',
        description: 'Crie um curso com titulo e descricao',
        operationId: 'createCourse',
        body: z.object({
          title: z.string().min(5, 'Titulo precisa de pelo menos 5 caracteres'),
          description: z.string().optional(),
        }),
        response: {
          201: z
            .object({
              courseId: z.uuid(),
            })
            .describe('Retorna o id do curso criado com sucesso!'),
        },
      },
    },
    async (request, reply) => {
      const { title, description } = request.body

      const result = await db
        .insert(courses)
        .values({
          title,
          description,
        })
        .returning({ id: courses.id })

      return reply.status(201).send({ courseId: result[0].id })
    },
  )
}
