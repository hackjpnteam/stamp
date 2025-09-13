import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { dbConnect } from '@/lib/mongoose'
import { User } from '@/models/User'
import { validateEnvironmentVariables } from '@/lib/env-check'
import { getAuthUrl } from '@/lib/auth-config'

// Validate environment variables on import
validateEnvironmentVariables()

// Vercel環境での動的URL設定
if (process.env.VERCEL) {
  process.env.NEXTAUTH_URL = 'https://stamp-omega.vercel.app'
  console.log('Force-configured NEXTAUTH_URL for Vercel:', process.env.NEXTAUTH_URL)
} else if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3001'
  console.log('Auto-configured NEXTAUTH_URL for development:', process.env.NEXTAUTH_URL)
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
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        console.log('🎯 Google Profile received:', JSON.stringify(profile, null, 2))
        const user = {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
        console.log('🎯 Google mapped user object:', JSON.stringify(user, null, 2))
        return user
      },
    }),
    {
      id: 'line',
      name: 'LINE',
      type: 'oauth',
      issuer: 'https://access.line.me',
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
      
      // Google または LINE プロバイダーの場合
      if (account?.provider === 'google' || account?.provider === 'line') {
        try {
          console.log('🔐 Attempting DB connection...')
          const connection = await dbConnect()
          console.log('🔐 DB connection result:', !!connection)
          
          let email: string
          let name: string
          
          if (account.provider === 'google') {
            email = user.email || profile?.email || `${profile?.sub}@gmail.com`
            name = user.name || profile?.name || 'Google User'
          } else {
            // LINE provider
            email = user.email || `${profile?.sub || account.providerAccountId}@line.local`
            name = user.name || 'LINE User'
          }
          
          console.log('🔐 Creating/updating user with:', { email, name, provider: account.provider })
          
          // データベース内のユーザー数をチェック（初回ユーザーを管理者に）
          const userCount = await User.countDocuments({})
          const isFirstUser = userCount === 0
          
          console.log('🔐 User count check:', { userCount, isFirstUser })
          
          const result = await User.findOneAndUpdate(
            { email },
            { 
              name,
              email,
              $setOnInsert: { 
                role: isFirstUser ? 'owner' : 'member', 
                groups: [] 
              }
            },
            { upsert: true, new: true }
          )
          
          console.log('🔐 User save result:', result ? 'SUCCESS' : 'FAILED')
          console.log('🔐 SignIn callback returning TRUE')
          
          return true
        } catch (error) {
          console.error('🚨 SignIn error, but returning TRUE to continue auth flow:', error)
          // デバッグのためエラーでもtrueを返す
          return true
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
      if (account?.provider === 'google' || account?.provider === 'line') {
        await dbConnect()
        
        let email: string
        if (account.provider === 'google') {
          email = token.email || profile?.email || `${profile?.sub}@gmail.com`
        } else {
          email = `${profile?.sub || account.providerAccountId}@line.local`
        }
        
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
  logger: {
    error(code, metadata) {
      console.error('🚨 NextAuth Error Code:', code)
      console.error('🚨 NextAuth Error Metadata:', JSON.stringify(metadata, null, 2))
    },
    warn(code) {
      console.warn('⚠️ NextAuth Warning:', code)
    },
    debug(code, metadata) {
      console.log('🐛 NextAuth Debug:', code, metadata)
    }
  },
}