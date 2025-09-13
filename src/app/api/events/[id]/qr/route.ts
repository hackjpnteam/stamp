import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Event } from '@/models/Event'
import { makeQrPayload } from '@/lib/qr'
import { jstDateString } from '@/lib/date'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Generating demo QR')
      const today = jstDateString()
      const { token } = makeQrPayload(params.id, today)
      
      return NextResponse.json({ 
        token,
        eventId: params.id,
        date: today,
        eventTitle: '夏休みラジオ体操 2024 (デモ)'
      })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const event = await Event.findById(params.id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const today = jstDateString()
    const { token } = makeQrPayload(params.id, today)

    return NextResponse.json({ 
      token,
      eventId: params.id,
      date: today,
      eventTitle: event.title
    })
  } catch (error) {
    console.error('GET /api/events/[id]/qr error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}