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
      const demoLoginHistory = [
        { 
          _id: 'demo-user-1', 
          name: 'デモユーザー', 
          email: 'demo@example.com', 
          role: 'member',
          lastLogin: new Date(Date.now() - 1000 * 60 * 30), // 30分前
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7日前
          loginCount: 5
        },
        { 
          _id: 'demo-user-2', 
          name: '田中太郎', 
          email: 'tanaka@demo.com', 
          role: 'member',
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2時間前
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14日前
          loginCount: 25
        },
        { 
          _id: 'demo-user-3', 
          name: '鈴木花子', 
          email: 'suzuki@demo.com', 
          role: 'member',
          lastLogin: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1日前
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10日前
          loginCount: 18
        },
        { 
          _id: 'demo-admin-1', 
          name: '管理者デモ', 
          email: 'admin@demo.com', 
          role: 'admin',
          lastLogin: new Date(Date.now() - 1000 * 60 * 5), // 5分前
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30日前
          loginCount: 50
        }
      ]
      console.log('Demo mode: Returning demo login history')
      return NextResponse.json({ loginHistory: demoLoginHistory })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 全ユーザーを最終ログイン日時順で取得
    const users = await User.find({})
      .select('name email role createdAt updatedAt')
      .sort('-updatedAt') // 最終更新日時でソート（ログイン時に更新される想定）

    // ログイン履歴情報を構築
    const loginHistory = users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.updatedAt, // 最終ログイン時間として使用
      createdAt: user.createdAt,
      loginCount: Math.floor(Math.random() * 50) + 1 // 仮のログイン回数（実際の実装では別テーブルで管理）
    }))

    return NextResponse.json({ loginHistory })
  } catch (error) {
    console.error('GET /api/users/login-history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}