import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      const demoUsers = [
        { _id: 'demo-user-1', name: 'デモユーザー', email: 'demo@example.com', role: 'member', createdAt: new Date() },
        { _id: 'demo-user-2', name: '田中太郎', email: 'tanaka@demo.com', role: 'member', createdAt: new Date() },
        { _id: 'demo-user-3', name: '鈴木花子', email: 'suzuki@demo.com', role: 'member', createdAt: new Date() },
        { _id: 'demo-admin-1', name: '管理者デモ', email: 'admin@demo.com', role: 'admin', createdAt: new Date() }
      ]
      console.log('Demo mode: Returning demo users')
      return NextResponse.json({ users: demoUsers })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const users = await User.find({})
      .select('name email role createdAt')
      .sort('-createdAt')

    return NextResponse.json({ users })
  } catch (error) {
    console.error('GET /api/users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}