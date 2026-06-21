import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let authSqlClient: NeonQueryFunction<false, false> | null = null

export function authSql(strings: TemplateStringsArray, ...params: unknown[]) {
  if (!authSqlClient) {
    const url =
      process.env.DATABASE_URL?.trim().replace(/^["']|["']$/g, '') ||
      process.env.POSTGRES_URL?.trim().replace(/^["']|["']$/g, '') ||
      process.env.NEON_DATABASE_URL?.trim().replace(/^["']|["']$/g, '')
    if (!url) {
      throw new Error('DATABASE_URL is not set')
    }
    authSqlClient = neon(url)
  }
  return authSqlClient(strings, ...params)
}
