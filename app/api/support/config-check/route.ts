import { NextResponse } from 'next/server'
import { getDbHost, getDbName } from '@/lib/db'
import { getResendApiKey, getResendApiKeys } from '@/lib/support/resend-credentials'

/** Safe runtime check — no secrets returned. */
export async function GET() {
  const keys = await getResendApiKeys()
  return NextResponse.json({
    dbHost: getDbHost(),
    dbName: getDbName(),
    resendEnv: Boolean(process.env.RESEND_API_KEY?.trim()),
    resendKeyCount: keys.length,
    resendReady: keys.length > 0,
  })
}
