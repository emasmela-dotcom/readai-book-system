import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'
import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

let sqlClient: NeonQueryFunction<false, false> | null = null
let sqlClientUrl: string | null = null

/** Prefer DATABASE_URL from .env when present so local `next start` matches scripts/repair. */
export function getDatabaseUrl(): string {
  for (const key of ['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'NEON_DATABASE_URL']) {
    const fromEnv = process.env[key]?.trim().replace(/^["']|["']$/g, '')
    if (fromEnv) return fromEnv
  }

  const envPath = resolve(process.cwd(), '.env')
  if (existsSync(envPath)) {
    const line = readFileSync(envPath, 'utf8')
      .split('\n')
      .find((l) => l.startsWith('DATABASE_URL='))
    if (line) {
      return line
        .slice('DATABASE_URL='.length)
        .trim()
        .replace(/^["']|["']$/g, '')
    }
  }

  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.NEON_DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }
  return url.replace(/^["']|["']$/g, '')
}

export function getDbHost(): string {
  const match = getDatabaseUrl().match(/@([^/]+)/)
  return match?.[1] ?? 'unknown'
}

export function getDbName(): string {
  try {
    const pathname = new URL(getDatabaseUrl().replace(/^postgresql:/, 'http:')).pathname
    return pathname.replace(/^\//, '') || 'unknown'
  } catch {
    return 'unknown'
  }
}

export function getSql(): NeonQueryFunction<false, false> {
  const url = getDatabaseUrl()
  if (!sqlClient || sqlClientUrl !== url) {
    sqlClientUrl = url
    sqlClient = neon(url)
  }
  return sqlClient
}

export function sql(strings: TemplateStringsArray, ...params: unknown[]) {
  return getSql()(strings, ...params)
}
