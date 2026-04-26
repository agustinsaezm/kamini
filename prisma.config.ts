import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'

config()

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
})
