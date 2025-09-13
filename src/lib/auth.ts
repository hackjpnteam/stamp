import { NextAuthOptions } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { Session } from 'next-auth'
import { dbConnect } from '@/lib/mongoose'
import { User } from '@/models/User'

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
        return {
          id: profile.userId,
          name: profile.displayName,
          email: `${profile.userId}@line.local`,
          image: profile.pictureUrl,
        }
      },
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      checks: ['state'],
    },
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'line') {
        await dbConnect()
        
        const email = user.email || `${profile?.sub || account.providerAccountId}@line.local`
        const name = user.name || 'LINE User'
        
        await User.findOneAndUpdate(
          { email },
          { 
            name,
            email,
            $setOnInsert: { role: 'member', groups: [] }
          },
          { upsert: true, new: true }
        )
      }
      return true
    },
    async jwt({ token, account, profile }) {
      if (account?.provider === 'line') {
        await dbConnect()
        const email = `${profile?.sub || account.providerAccountId}@line.local`
        const dbUser = await User.findOne({ email })
        
        if (dbUser) {
          token.id = dbUser._id.toString()
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
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
}