import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Event } from '@/models/Event'
import { Attendance } from '@/models/Attendance'
import { User } from '@/models/User'

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      const demoRanking = [
        { userId: 'demo-user-1', name: 'デモユーザー', stamps: 3, rank: 1 },
        { userId: 'demo-user-2', name: '田中太郎', stamps: 31, rank: 1 },
        { userId: 'demo-user-3', name: '鈴木花子', stamps: 28, rank: 2 },
        { userId: 'demo-user-4', name: '佐藤次郎', stamps: 25, rank: 3 },
        { userId: 'demo-user-5', name: '山田花子', stamps: 22, rank: 4 }
      ]
      console.log('Demo mode: Returning demo ranking')
      return NextResponse.json({ ranking: demoRanking })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      const demoRanking = [
        { userId: 'demo-user-1', name: 'デモユーザー', stamps: 3, rank: 1 },
        { userId: 'demo-user-2', name: '田中太郎', stamps: 31, rank: 1 },
        { userId: 'demo-user-3', name: '鈴木花子', stamps: 28, rank: 2 },
        { userId: 'demo-user-4', name: '佐藤次郎', stamps: 25, rank: 3 },
        { userId: 'demo-user-5', name: '山田花子', stamps: 22, rank: 4 }
      ]
      console.log('No session: Returning demo ranking for demo mode')
      return NextResponse.json({ ranking: demoRanking })
    }

    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    
    let query: any = {}
    if (eventId) {
      query.event = eventId
    }

    // 全ユーザーの出席数を集計
    const attendanceStats = await Attendance.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$user',
          stampCount: { $sum: 1 }
        }
      },
      { $sort: { stampCount: -1 } },
      { $limit: 50 } // 上位50人まで
    ])

    // ユーザー情報を取得
    const userIds = attendanceStats.map(stat => stat._id)
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email')

    // ランキングデータを作成
    const ranking = attendanceStats.map((stat, index) => {
      const user = users.find(u => (u._id as any).toString() === stat._id.toString())
      return {
        userId: stat._id,
        name: user?.name || 'Unknown',
        email: user?.email || '',
        stamps: stat.stampCount,
        rank: index + 1
      }
    })

    return NextResponse.json({ ranking })
  } catch (error) {
    console.error('GET /api/ranking error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}