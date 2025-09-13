import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // 本番環境でのデバッグ情報（セキュリティに配慮）
  const debug = {
    env: {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Missing',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      LINE_CLIENT_ID: process.env.LINE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? '✅ Running on Vercel' : '❌ Not on Vercel',
      VERCEL_URL: process.env.VERCEL_URL || 'Not set',
    },
    headers: {
      host: req.headers.get('host'),
      referer: req.headers.get('referer'),
      'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
      'x-forwarded-host': req.headers.get('x-forwarded-host'),
    },
    url: {
      origin: req.nextUrl.origin,
      pathname: req.nextUrl.pathname,
      href: req.nextUrl.href,
    },
    computed: {
      expectedCallbackUrl: `${req.nextUrl.origin}/api/auth/callback/line`,
      actualNextAuthUrl: process.env.NEXTAUTH_URL,
      urlMatch: process.env.NEXTAUTH_URL === req.nextUrl.origin ? '✅ Match' : '❌ Mismatch',
    }
  }

  return NextResponse.json(debug)
}