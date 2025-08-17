import { fakerPT_BR as faker } from '@faker-js/faker'
import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app.ts'
import { makeAuthenticatedUser } from '../tests/factories/make-user.ts'

describe('Create course e2e', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('criar um curso com sucesso', async () => {
    const { accessToken } = await makeAuthenticatedUser({ role: 'MANAGER' })

    const response = await request(app.server)
      .post('/courses')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: faker.lorem.word(6),
        description: faker.lorem.sentence(),
      })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({
      courseId: expect.any(String),
    })
  })

  it('não deve criar um curso sem autenticacao', async () => {
    const response = await request(app.server)
      .post('/courses')
      .set('Content-Type', 'application/json')
      .send({
        title: faker.lorem.word(6),
        description: faker.lorem.sentence(),
      })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({})
  })

  it('não deve criar um curso sem permissão de MANAGER', async () => {
    const { accessToken } = await makeAuthenticatedUser({ role: 'STUDENT' })

    const response = await request(app.server)
      .post('/courses')
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: faker.lorem.word(6),
        description: faker.lorem.sentence(),
      })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({})
  })
})
