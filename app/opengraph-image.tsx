import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'ReadAI365 — Find any book and where you can read it'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(145deg, #120d0b 0%, #1a1410 55%, #2a1f18 100%)',
          color: '#f6efe7',
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 8,
            textTransform: 'uppercase',
            color: '#d8b67c',
            marginBottom: 28,
          }}
        >
          Private reading club
        </div>
        <div
          style={{
            fontSize: 72,
            lineHeight: 1.05,
            fontWeight: 700,
            maxWidth: 980,
          }}
        >
          ReadAI365
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.35,
            color: '#eadfce',
            maxWidth: 920,
          }}
        >
          Find any book and where you can read it.
        </div>
      </div>
    ),
    { ...size },
  )
}
