import { readFileSync } from 'node:fs'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifyApiReference from '@scalar/fastify-api-reference'
import fastify from 'fastify'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { env } from './config/env.ts'
import { authenticateWithPasswordRoute } from './routes/authenticate-with-password.ts'
import { createCourseRoute } from './routes/create-course.ts'
import { getCourseByIdRoute } from './routes/get-course-by-id.ts'
import { getCoursesRoute } from './routes/get-courses.ts'

const app = fastify({
  logger:
    env.NODE_ENV === 'development'
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
        }
      : false,
}).withTypeProvider<ZodTypeProvider>()

if (env.NODE_ENV === 'development') {
  app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Desafio Node.js API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${env.PORT}`,
        },
      ],
    },
    transform: jsonSchemaTransform,
  })

  app.register(fastifyApiReference, {
    routePrefix: '/docs',
  })
}

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

const privateKey = readFileSync(new URL('../certs/private_key.pem', import.meta.url), 'utf-8')

const publicKey = readFileSync(new URL('../certs/public_key.pem', import.meta.url), 'utf-8')

app.register(fastifyJwt, {
  secret: {
    private: privateKey,
    public: publicKey,
  },
  sign: {
    algorithm: 'RS256',
  },
})

app.get('/health', () => {
  return 'ok'
})

app.register(authenticateWithPasswordRoute)
app.register(getCoursesRoute)
app.register(getCourseByIdRoute)
app.register(createCourseRoute)

export { app }
