import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  // LINE OAuth設定のテスト
  const config = {
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'Yes' : 'No',
    },
    line: {
      clientId: process.env.LINE_CLIENT_ID ? '✅ Set' : '❌ Missing',
      clientSecret: process.env.LINE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
      clientIdValue: process.env.LINE_CLIENT_ID?.substring(0, 4) + '****',
    },
    nextauth: {
      url: process.env.NEXTAUTH_URL || 'Not set',
      secret: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
      computedCallbackUrl: `${process.env.NEXTAUTH_URL || 'https://stamp-omega.vercel.app'}/api/auth/callback/line`,
    },
    mongodb: {
      uri: process.env.MONGODB_URI ? '✅ Connected' : '❌ Missing',
    },
    request: {
      host: req.headers.get('host'),
      protocol: req.headers.get('x-forwarded-proto') || 'https',
      fullUrl: req.url,
    }
  }

  // MongoDB接続テスト
  try {
    if (process.env.MONGODB_URI) {
      const { dbConnect } = await import('@/lib/mongoose')
      await dbConnect()
      config.mongodb.uri = '✅ Connected successfully'
    }
  } catch (error: any) {
    config.mongodb.uri = `❌ Connection failed: ${error.message}`
  }

  return NextResponse.json(config, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  })
}