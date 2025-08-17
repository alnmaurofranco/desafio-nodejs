import { faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app.ts'
import { db } from '../database/client.ts'
import { courses, enrollments } from '../database/schema.ts'
import { makeCourse } from '../tests/factories/make-course.ts'
import { makeAuthenticatedUser } from '../tests/factories/make-user.ts'

describe('Get courses e2e', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('obter lista de cursos pelo titulo com sucesso', async () => {
    const { accessToken } = await makeAuthenticatedUser()
    const titleId = faker.string.uuid()

    await makeCourse({ title: titleId })

    const response = await request(app.server)
      .get(`/courses?search=${titleId}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      courses: expect.arrayContaining([
        {
          id: expect.any(String),
          title: titleId,
          enrollmentsCount: 0,
        },
      ]),
      metadata: expect.objectContaining({
        pageIndex: 1,
        perPage: 10,
        totalCount: 1,
      }),
    })
  })

  it('obter lista de cursos por paginação com sucesso', async () => {
    const { accessToken } = await makeAuthenticatedUser()

    await db.transaction(async trx => {
      await trx.delete(courses)
      await trx.delete(enrollments)

      for await (const _ of Array.from({ length: 20 }).keys()) {
        await makeCourse({ title: faker.lorem.word(6) + _ })
      }
    })

    const response = await request(app.server)
      .get('/courses?pageIndex=2&perPage=10')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      courses: expect.arrayContaining([
        {
          id: expect.any(String),
          title: expect.any(String),
          enrollmentsCount: expect.any(Number),
        },
      ]),
      metadata: expect.objectContaining({
        pageIndex: 2,
        perPage: 10,
        totalCount: 20,
      }),
    })
  })

  it('obter lista de cursos por ordenação do titulo em ordem crescente com sucesso', async () => {
    const { accessToken } = await makeAuthenticatedUser()

    await db.transaction(async trx => {
      await trx.delete(courses)
      await trx.delete(enrollments)

      for await (const _ of Array.from({ length: 10 }).keys()) {
        await makeCourse({ title: `curso-${_}` })
      }
    })

    const response = await request(app.server)
      .get('/courses?pageIndex=1&perPage=10&orderBy=title&orderDirection=asc')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      courses: expect.arrayContaining([
        {
          id: expect.any(String),
          title: 'curso-0',
          enrollmentsCount: 0,
        },
        {
          id: expect.any(String),
          title: 'curso-1',
          enrollmentsCount: 0,
        },
      ]),
      metadata: expect.objectContaining({
        pageIndex: 1,
        perPage: 10,
        totalCount: 10,
      }),
    })
  })

  it('obter lista de cursos por ordenação do titulo em ordem decrescente com sucesso', async () => {
    const { accessToken } = await makeAuthenticatedUser()

    await db.transaction(async trx => {
      await trx.delete(courses)
      await trx.delete(enrollments)

      for await (const _ of Array.from({ length: 10 }).keys()) {
        await makeCourse({ title: `cursox-${_}` })
      }
    })

    const response = await request(app.server)
      .get('/courses?pageIndex=1&perPage=10&orderBy=title&orderDirection=desc')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send()

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      courses: expect.arrayContaining([
        {
          id: expect.any(String),
          title: 'cursox-9',
          enrollmentsCount: 0,
        },
        {
          id: expect.any(String),
          title: 'cursox-8',
          enrollmentsCount: 0,
        },
      ]),
      metadata: expect.objectContaining({
        pageIndex: 1,
        perPage: 10,
        totalCount: 10,
      }),
    })
  })
})
