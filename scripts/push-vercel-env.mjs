/**
 * Push local + Neon secrets to Vercel (readai-book-system-c11p).
 * Requires: vercel login OR VERCEL_TOKEN in environment.
 */
import { spawnSync } from 'node:child_process'
import { config } from 'dotenv'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
config()

const PROJECT = process.env.VERCEL_PROJECT || 'readai-book-system-c11p'
const SCOPE = process.env.VERCEL_SCOPE || 'erics-projects-b395e20f'
const ENVS = ['production', 'preview', 'development']

async function loadResendKey() {
  try {
    const { getResendApiKey } = await import('../lib/support/resend-credentials.ts')
    return await getResendApiKey()
  } catch {
    return process.env.RESEND_API_KEY?.trim() || null
  }
}

function addEnv(name, value) {
  if (!value) {
    console.log(`skip ${name} (empty)`)
    return false
  }

  let ok = true
  for (const env of ENVS) {
    const result = spawnSync(
      'vercel',
      [
        'env',
        'add',
        name,
        env,
        '--force',
        '--sensitive',
        '--project',
        PROJECT,
        '--scope',
        SCOPE,
      ],
      { input: value, encoding: 'utf8' },
    )
    if (result.status !== 0) {
      console.error(`failed ${name} (${env}) exit ${result.status}`)
      ok = false
    } else {
      console.log(`ok ${name} (${env})`)
    }
  }
  return ok
}

const resendKey = await loadResendKey()

const vars = {
  DATABASE_URL: process.env.DATABASE_URL?.trim(),
  RESEND_API_KEY: resendKey,
  STRIPE_PRICE_MONTHLY: process.env.STRIPE_PRICE_MONTHLY?.trim(),
  STRIPE_PRICE_YEARLY: process.env.STRIPE_PRICE_YEARLY?.trim(),
}

console.log(`Pushing env to ${SCOPE}/${PROJECT}...`)
console.log(
  'keys:',
  Object.fromEntries(Object.entries(vars).map(([k, v]) => [k, Boolean(v)])),
)

let failed = false
for (const [name, value] of Object.entries(vars)) {
  if (!addEnv(name, value)) failed = true
}

if (failed) {
  console.error('Some variables failed. Run: vercel login')
  process.exit(1)
}

console.log('Done. Redeploying production...')
const deploy = spawnSync(
  'vercel',
  ['deploy', '--prod', '--yes', '--project', PROJECT, '--scope', SCOPE],
  { stdio: 'inherit' },
)
process.exit(deploy.status ?? 1)
