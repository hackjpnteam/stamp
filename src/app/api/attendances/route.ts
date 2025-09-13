import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Attendance } from '@/models/Attendance'
import { demoAttendances } from '@/lib/demo-data'

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Returning demo attendances')
      return NextResponse.json({ attendances: demoAttendances })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Returning demo attendances for demo mode')
      return NextResponse.json({ attendances: demoAttendances })
    }
    
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const attendances = await Attendance.find({
      user: session.user.id,
      event: eventId
    }).sort('date')

    return NextResponse.json({ attendances })
  } catch (error) {
    console.error('GET /api/attendances error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}