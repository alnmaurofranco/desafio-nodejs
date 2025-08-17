import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../app.ts'
import { makeUser } from '../tests/factories/make-user.ts'

describe('Authenticate with password e2e', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('deve autenticar com e-mail e senha com sucesso', async () => {
    const { passwordBeforeHash, user } = await makeUser()

    const response = await request(app.server).post('/sessions/password').set('Content-Type', 'application/json').send({
      email: user.email,
      password: passwordBeforeHash,
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toEqual({
      accessToken: expect.any(String),
    })
  })

  it.skip('não deve autenticar com e-mail ou senha inválido', async () => {
    const response = await request(app.server).post('/sessions/password').set('Content-Type', 'application/json').send({
      email: 'invalid-email',
      password: 'invalid-password',
    })

    expect(response.statusCode).toBe(401)
    expect(response.body).toEqual({
      message: 'Credenciais inválidas',
    })
  })
})
