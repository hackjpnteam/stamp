import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { dbConnect } from '@/lib/mongoose'
import { User } from '@/models/User'
import { validateEnvironmentVariables } from '@/lib/env-check'
import { getAuthUrl } from '@/lib/auth-config'

// Validate environment variables on import
validateEnvironmentVariables()

// Vercel環境での動的URL設定
if (process.env.VERCEL && !process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = getAuthUrl()
  console.log('Auto-configured NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'member' | 'admin' | 'owner'
      sub?: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: 'member' | 'admin' | 'owner'
    sub?: string
  }
}

export const authOptions: NextAuthOptions = {
  debug: true, // 本番環境でもデバッグログを有効化
  providers: [
    {
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      authorization: {
        url: 'https://access.line.me/oauth2/v2.1/authorize',
        params: {
          scope: 'profile',
          response_type: 'code',
        },
      },
      token: 'https://api.line.me/oauth2/v2.1/token',
      userinfo: 'https://api.line.me/v2/profile',
      profile(profile) {
        console.log('🎯 LINE Profile received:', JSON.stringify(profile, null, 2))
        const user = {
          id: profile.userId,
          name: profile.displayName,
          email: `${profile.userId}@line.local`,
          image: profile.pictureUrl,
        }
        console.log('🎯 Mapped user object:', JSON.stringify(user, null, 2))
        return user
      },
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      checks: ['state'],
      // Vercel環境でのコールバック URL
      redirectUri: process.env.VERCEL 
        ? 'https://stamp-omega.vercel.app/api/auth/callback/line'
        : 'http://localhost:3001/api/auth/callback/line',
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log('🔐 SignIn callback triggered:', { 
        provider: account?.provider,
        userId: user?.id,
        email: user?.email,
        profileSub: profile?.sub,
        accountProviderAccountId: account?.providerAccountId
      })
      console.log('🔐 Full user object:', JSON.stringify(user, null, 2))
      console.log('🔐 Full account object:', JSON.stringify(account, null, 2))
      console.log('🔐 Full profile object:', JSON.stringify(profile, null, 2))
      
      if (account?.provider === 'line') {
        try {
          console.log('🔐 Attempting DB connection...')
          const connection = await dbConnect()
          console.log('🔐 DB connection result:', !!connection)
          
          const email = user.email || `${profile?.sub || account.providerAccountId}@line.local`
          const name = user.name || 'LINE User'
          
          console.log('🔐 Creating/updating user with:', { email, name })
          
          const result = await User.findOneAndUpdate(
            { email },
            { 
              name,
              email,
              $setOnInsert: { role: 'member', groups: [] }
            },
            { upsert: true, new: true }
          )
          
          console.log('🔐 User save result:', result ? 'SUCCESS' : 'FAILED')
          
          return true
        } catch (error) {
          console.error('🚨 SignIn error:', error)
          return false
        }
      }
      console.log('🔐 Non-LINE provider, returning true')
      return true
    },
    async redirect({ url, baseUrl }) {
      // ログイン後のリダイレクト先を決定
      console.log('NextAuth redirect callback:', { url, baseUrl })
      
      // エラーの場合はエラーページへ
      if (url.includes('error=')) {
        return '/error' + url.substring(url.indexOf('?'))
      }
      
      // URLがコールバックURLの場合
      if (url.startsWith(baseUrl + '/api/auth/callback')) {
        // デフォルトでマイページ(/auth)にリダイレクト
        return baseUrl + '/auth'
      }
      
      // callbackUrlパラメータの無限ループを防ぐ
      if (url.includes('callbackUrl=')) {
        // callbackUrlを除去してクリーンなURLに
        return baseUrl + '/auth'
      }
      
      // 既に指定されたコールバックURLがある場合はそれを使用
      if (url.startsWith(baseUrl)) {
        return url
      }
      
      // 外部URLの場合はベースURLにリダイレクト
      return baseUrl + '/auth'
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'line') {
        await dbConnect()
        const email = `${profile?.sub || account.providerAccountId}@line.local`
        const dbUser = await User.findOne({ email })
        
        if (dbUser) {
          token.id = (dbUser._id as any).toString()
          token.role = dbUser.role
          token.sub = profile?.sub || account.providerAccountId
        }
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.sub = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/',
    error: '/error',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('🚀 NextAuth SignIn Event:', { 
        provider: account?.provider,
        userId: user?.id,
        email: user?.email,
        isNewUser 
      })
    },
    async signOut({ session, token }) {
      console.log('👋 NextAuth SignOut Event:', { sessionId: session?.user?.id })
    },
    async createUser({ user }) {
      console.log('👤 NextAuth CreateUser Event:', { userId: user.id, email: user.email })
    },
    async session({ session, token }) {
      console.log('🎫 NextAuth Session Event:', { userId: session?.user?.id })
    },
    async linkAccount({ user, account, profile }) {
      console.log('🔗 NextAuth LinkAccount Event:', { 
        provider: account.provider,
        userId: user.id 
      })
    }
  },
  session: {
    strategy: 'jwt',
  },
}