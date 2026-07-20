#!/usr/bin/env node
/**
 * One-shot IndexNow submit for public ReadAI365 URLs.
 * Usage: node scripts/submit-indexnow.mjs
 */

const KEY = '0f15478254b3f6ba28aa6a4e7219e929'
const HOST = 'www.readai365.com'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

const urlList = [
  'https://www.readai365.com/',
  'https://www.readai365.com/sources',
  'https://www.readai365.com/genres/cooking',
  'https://www.readai365.com/support',
  'https://www.readai365.com/subscribe',
  'https://www.readai365.com/sign-up',
  'https://www.readai365.com/sign-in',
  'https://www.readai365.com/llms.txt',
  'https://www.readai365.com/sitemap.xml',
]

async function main() {
  const keyRes = await fetch(KEY_LOCATION)
  const keyBody = (await keyRes.text()).trim()
  console.log('key file status', keyRes.status, 'body matches', keyBody === KEY)

  if (!keyRes.ok || keyBody !== KEY) {
    console.error('IndexNow key file is not live yet. Deploy first, then re-run.')
    process.exit(1)
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    }),
  })

  const text = await res.text()
  console.log('IndexNow status', res.status)
  console.log(text || '(empty body)')
  if (res.status !== 200 && res.status !== 202) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
