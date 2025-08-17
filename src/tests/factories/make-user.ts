import { randomUUID } from 'node:crypto'
import { faker } from '@faker-js/faker'
import { hash } from 'argon2'
import { app } from '../../app.ts'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema.ts'

interface MakeUserProps {
  name?: string
  email?: string
  password?: string
  role?: (typeof users.$inferInsert)['role']
}

export async function makeUser(overrides: MakeUserProps = {}) {
  const passwordBeforeHash = randomUUID()
  const passwordHash = await hash(passwordBeforeHash)

  const user = await db
    .insert(users)
    .values({
      name: overrides.name ?? faker.person.firstName(),
      email: overrides.email ?? faker.internet.email(),
      password: overrides.password ?? passwordHash,
      role: overrides.role ?? 'STUDENT',
    })
    .returning()

  return { user: user[0], passwordBeforeHash }
}

export async function makeAuthenticatedUser(overrides: MakeUserProps = {}) {
  const { user } = await makeUser(overrides)

  const accessToken = app.jwt.sign(
    {
      role: user.role,
    },
    {
      sub: user.id,
    },
  )

  return {
    user,
    accessToken,
  }
}
