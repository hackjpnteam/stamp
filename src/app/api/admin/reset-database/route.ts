import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { User } from '@/models/User'
import { Event } from '@/models/Event'
import { Attendance } from '@/models/Attendance'

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 認証チェック
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 管理者権限チェック（最初のユーザーまたは明示的な管理者のみ）
    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const connection = await dbConnect()
    
    if (!connection) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    console.log('🗑️ Database reset initiated by:', session.user.email)

    // 全てのコレクションをクリア
    const deleteResults = await Promise.all([
      Attendance.deleteMany({}),
      Event.deleteMany({}),
      User.deleteMany({})
    ])

    console.log('🗑️ Reset results:', {
      attendances: deleteResults[0].deletedCount,
      events: deleteResults[1].deletedCount,
      users: deleteResults[2].deletedCount
    })

    // 管理者ユーザーを再作成
    const adminUser = await User.create({
      name: session.user.name || 'Administrator',
      email: session.user.email,
      role: 'owner',
      groups: []
    })

    console.log('🛠️ Admin user recreated:', adminUser.email)

    return NextResponse.json({ 
      success: true,
      message: 'Database reset successfully',
      deletedCounts: {
        attendances: deleteResults[0].deletedCount,
        events: deleteResults[1].deletedCount,
        users: deleteResults[2].deletedCount - 1 // 管理者ユーザーを除く
      },
      adminUser: {
        id: adminUser._id,
        email: adminUser.email,
        role: adminUser.role
      }
    })

  } catch (error) {
    console.error('🚨 Database reset error:', error)
    return NextResponse.json({ 
      error: 'Database reset failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}