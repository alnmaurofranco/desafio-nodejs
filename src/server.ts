import fs from 'node:fs'
import { app } from './app.ts'
import { env } from './config/env.ts'

app
  .listen({
    port: env.PORT,
    host: '0.0.0.0',
  })
  .then(() => {
    app.log.info(`Server running on port ${env.PORT}`)
  })

app.ready().then(() => {
  const specificationOpenAPI = app.swagger()

  fs.writeFileSync(new URL('../swagger.json', import.meta.url), JSON.stringify(specificationOpenAPI, null, 2))
})
