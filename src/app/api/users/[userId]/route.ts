import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = params.userId

    // デモユーザーデータ
    const demoUsers: { [key: string]: any } = {
      'demo-user-1': {
        id: 'demo-user-1',
        name: 'デモユーザー',
        image: null,
        profileText: 'ラジオ体操を通じて健康的な生活を心がけています。毎朝6時から参加して、みんなと一緒に体を動かすのが日課です！',
        level: '健康マスター',
        participationCount: 32,
        streak: 7,
        joinDate: '2024年4月',
        badges: ['早起き王', '継続は力なり', '健康優等生']
      },
      'demo-user-2': {
        id: 'demo-user-2',
        name: '田中太郎',
        image: null,
        profileText: '定年退職後にラジオ体操を始めました。地域の皆さんとの交流が楽しく、毎日の活力になっています。体調も良くなりました！',
        level: 'プラチナマスター',
        participationCount: 58,
        streak: 15,
        joinDate: '2024年1月',
        badges: ['ベテラン', '皆勤賞', 'コミュニティリーダー']
      },
      'demo-user-3': {
        id: 'demo-user-3',
        name: '鈴木花子',
        image: null,
        profileText: '子育ての合間にラジオ体操に参加しています。短時間でも気分転換になり、ママ友もできて嬉しいです♪',
        level: '健康マスター',
        participationCount: 28,
        streak: 4,
        joinDate: '2024年5月',
        badges: ['新人賞', 'ママさん頑張り屋']
      }
    }

    // 現在のログインユーザーかチェック
    const isCurrentUser = userId === session?.user?.id || userId === 'demo-user-1'
    
    // ローカルストレージのプロフィールデータも統合
    let userProfile = demoUsers[userId]
    
    // 現在のログインユーザーの場合、セッション情報を使用
    if (isCurrentUser && session?.user) {
      userProfile = {
        id: userId,
        name: session.user.name || 'ユーザー',
        image: (session.user as any).image || null,
        profileText: 'ラジオ体操を通じて健康的な生活を心がけています。毎朝6時から参加して、みんなと一緒に体を動かすのが日課です！',
        level: '健康マスター',
        participationCount: 32,
        streak: 7,
        joinDate: '2024年4月',
        badges: ['早起き王', '継続は力なり', '健康優等生'],
        recentHistory: [
          { date: '2025-09-13', event: '散歩', time: '06:00' },
          { date: '2025-09-12', event: '夏休みラジオ体操 2024', time: '06:30' },
          { date: '2025-09-11', event: '散歩', time: '06:00' },
          { date: '2025-09-10', event: '夏休みラジオ体操 2024', time: '06:30' },
        ]
      }
    } else if (!userProfile) {
      // 動的に生成されたユーザーID（user-1757749662599など）の処理
      const randomParticipation = Math.floor(Math.random() * 20) + 5
      const randomStreak = Math.floor(Math.random() * 10) + 1
      
      userProfile = {
        id: userId,
        name: `ユーザー${userId.slice(-4)}`, // IDの末尾4桁を名前に
        image: null,
        profileText: '朝活で健康的な生活を目指しています！毎日の積み重ねが大切ですね。',
        level: randomParticipation > 15 ? '健康マスター' : 'ビギナー',
        participationCount: randomParticipation,
        streak: randomStreak,
        joinDate: '2024年9月',
        badges: randomParticipation > 15 ? ['継続は力なり', '朝活マスター'] : ['新人', '早起きチャレンジャー'],
        recentHistory: [
          { date: '2025-09-13', event: '散歩', time: '06:00' },
          { date: '2025-09-12', event: '朝活イベント', time: '06:30' },
          { date: '2025-09-11', event: '散歩', time: '06:00' },
        ]
      }
    }

    // 既存のデモユーザーにも参加履歴を追加
    if (demoUsers[userId]) {
      userProfile.recentHistory = [
        { date: '2025-09-13', event: '散歩', time: '06:00' },
        { date: '2025-09-12', event: '夏休みラジオ体操 2024', time: '06:30' },
        { date: '2025-09-11', event: '散歩', time: '06:00' },
        { date: '2025-09-10', event: '夏休みラジオ体操 2024', time: '06:30' },
      ]
    }

    return NextResponse.json({ user: userProfile })
  } catch (error) {
    console.error('GET /api/users/[userId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}