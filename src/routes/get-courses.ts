import { and, asc, count, desc, eq, ilike, type SQL } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../database/client.ts'
import { courses, enrollments } from '../database/schema.ts'
import { checkRequestJWT } from './hooks/check-request-jwt.ts'

// biome-ignore lint/suspicious/useAwait: <>
export const getCoursesRoute: FastifyPluginAsyncZod = async app => {
  app.get(
    '/courses',
    {
      preHandler: checkRequestJWT,
      schema: {
        tags: ['Courses'],
        summary: 'Lista de cursos',
        description: 'Retorna uma lista de cursos com id e titulo',
        operationId: 'getCourses',
        querystring: z.object({
          search: z.string().optional().describe('Faz a busca por titulo do curso quando informado'),
          orderBy: z
            .enum(['id', 'title'])
            .optional()
            .default('id')
            .describe('Ordena a lista de cursos por id ou titulo'),
          orderDirection: z.enum(['asc', 'desc']).optional().default('asc').describe('Indica a direção da ordenação'),
          pageIndex: z.coerce.number().min(1).optional().default(1).describe('Indica a pagina atual'),
          perPage: z.coerce
            .number()
            .min(1)
            .max(100)
            .optional()
            .default(10)
            .describe('Indica a quantidade de cursos por pagina'),
        }),
        response: {
          200: z
            .object({
              courses: z.array(
                z.object({
                  id: z.string(),
                  title: z.string(),
                  enrollmentsCount: z.number(),
                }),
              ),
              metadata: z.object({
                pageIndex: z.number(),
                perPage: z.number(),
                totalCount: z.number(),
              }),
            })
            .describe('Lista de cursos com id e titulo com sucesso!'),
        },
      },
    },
    async (request, reply) => {
      const { search, orderBy, pageIndex, perPage, orderDirection } = request.query
      const conditions: SQL[] = []

      if (search) {
        conditions.push(ilike(courses.title, `%${search}%`))
      }

      const [result, totalCount] = await Promise.all([
        db
          .select({
            id: courses.id,
            title: courses.title,
            enrollmentsCount: count(enrollments.id).as('enrollmentsCount'),
          })
          .from(courses)
          .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
          .where(and(...conditions))
          .orderBy(orderDirection === 'asc' ? asc(courses[orderBy]) : desc(courses[orderBy]))
          .groupBy(courses.id)
          .offset((pageIndex - 1) * perPage)
          .limit(perPage),
        db.$count(courses, and(...conditions)),
      ])

      return reply.status(200).send({
        courses: result,
        metadata: { pageIndex, perPage, totalCount },
      })
    },
  )
}
