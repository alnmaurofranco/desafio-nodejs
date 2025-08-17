import { fakerPT_BR as faker } from '@faker-js/faker'
import { hash } from 'argon2'
import { db } from './client.ts'
import { courses, enrollments, users } from './schema.ts'

export async function seed() {
  const passwordHash = await hash('123456')

  const usersInsert = await db
    .insert(users)
    .values([
      {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: 'STUDENT',
      },
      {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: 'STUDENT',
      },
      {
        name: faker.person.firstName(),
        email: faker.internet.email(),
        password: passwordHash,
        role: 'STUDENT',
      },
    ])
    .returning()

  const coursesInsert = await db
    .insert(courses)
    .values([
      { title: faker.lorem.word(4), description: faker.lorem.sentence() },
      { title: faker.lorem.word(4), description: faker.lorem.sentence() },
      { title: faker.lorem.word(4), description: faker.lorem.sentence() },
    ])
    .returning()

  await db.insert(enrollments).values([
    { courseId: coursesInsert[0].id, userId: usersInsert[0].id },
    { courseId: coursesInsert[1].id, userId: usersInsert[1].id },
    { courseId: coursesInsert[2].id, userId: usersInsert[2].id },
  ])
}

seed()
  .then(() => {
    // biome-ignore lint/suspicious/noConsole: <mostra mensagem no console>
    console.log('Database seeded')
    process.exit(0)
  })
  .catch(error => {
    // biome-ignore lint/suspicious/noConsole: <mostra mensagem no console>
    console.error('Error seeding database', error)
    process.exit(1)
  })
