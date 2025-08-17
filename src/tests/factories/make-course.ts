import { fakerPT_BR as faker } from '@faker-js/faker'
import { db } from '../../database/client.ts'
import { courses } from '../../database/schema.ts'

interface MakeCourseProps {
  title?: string
  description?: string
}

export async function makeCourse({ title, description }: MakeCourseProps = {}) {
  const result = await db
    .insert(courses)
    .values({
      title: title ?? faker.lorem.word(6),
      description: description ?? faker.lorem.sentence(),
    })
    .returning()

  return result[0]
}
