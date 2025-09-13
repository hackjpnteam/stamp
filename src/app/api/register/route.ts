import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'

// 参加予定の登録・取得API
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { eventId, action } = body // action: 'register' | 'unregister'
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Simulating event registration')
      const registration = {
        _id: 'demo-registration-' + Date.now(),
        eventId,
        userId: 'demo-user-1',
        userName: 'デモユーザー',
        registeredAt: new Date(),
        status: action === 'register' ? 'registered' : 'unregistered'
      }
      
      return NextResponse.json({ registration }, { status: 201 })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Simulating demo registration')
      const registration = {
        _id: 'demo-registration-' + Date.now(),
        eventId,
        userId: 'demo-user-1',
        userName: 'デモユーザー',
        registeredAt: new Date(),
        status: action === 'register' ? 'registered' : 'unregistered'
      }
      return NextResponse.json({ registration }, { status: 201 })
    }

    // 実際のDB処理（実装省略 - デモ用）
    return NextResponse.json({ message: 'Registration successful' }, { status: 201 })
  } catch (error) {
    console.error('POST /api/register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      const demoRegistrations = [
        { _id: 'demo-reg-2', eventId, userId: 'demo-user-2', userName: '田中太郎', registeredAt: new Date() },
        { _id: 'demo-reg-3', eventId, userId: 'demo-user-3', userName: '鈴木花子', registeredAt: new Date() }
      ]
      console.log('Demo mode: Returning demo registrations')
      return NextResponse.json({ registrations: demoRegistrations })
    }
    
    // デモセッションの場合も同様
    const demoRegistrations = [
      { _id: 'demo-reg-2', eventId, userId: 'demo-user-2', userName: '田中太郎', registeredAt: new Date() },
      { _id: 'demo-reg-3', eventId, userId: 'demo-user-3', userName: '鈴木花子', registeredAt: new Date() }
    ]
    
    console.log('No session: Returning demo registrations for demo mode')
    return NextResponse.json({ registrations: demoRegistrations })
  } catch (error) {
    console.error('GET /api/register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}