import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Event } from '@/models/Event'
import { Attendance } from '@/models/Attendance'
import { RuleConfig } from '@/models/RuleConfig'
import { verifyQrToken } from '@/lib/qr'
import { jstDateString, inDailyWindow } from '@/lib/date'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Simulating check-in')
      return NextResponse.json({ 
        ok: true,
        duplicated: false,
        attendance: {
          id: 'demo-attendance-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          method: 'demo'
        }
      }, { status: 201 })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Simulating demo check-in')
      return NextResponse.json({ 
        ok: true,
        duplicated: false,
        attendance: {
          id: 'demo-attendance-' + Date.now(),
          date: new Date().toISOString().split('T')[0],
          method: 'demo'
        }
      }, { status: 201 })
    }
    
    const body = await req.json()
    const { token, eventId: manualEventId } = body

    let eventId: string
    let date: string
    let method: 'qr' | 'manual' = 'manual'

    if (token) {
      const payload = verifyQrToken(token)
      if (!payload) {
        return NextResponse.json({ error: 'Invalid QR token' }, { status: 400 })
      }
      eventId = payload.eventId
      date = payload.date
      method = 'qr'
    } else if (manualEventId) {
      eventId = manualEventId
      date = jstDateString()
    } else {
      return NextResponse.json({ error: 'Token or eventId required' }, { status: 400 })
    }

    const event = await Event.findById(eventId).populate('group')
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const ruleConfig = await RuleConfig.findOne({ group: event.group })
    const graceMinutes = ruleConfig?.graceMinutes || 0

    if (!inDailyWindow(new Date(), event.dailyWindowStart, event.dailyWindowEnd, graceMinutes)) {
      return NextResponse.json({ 
        error: 'Outside daily check-in window',
        window: {
          start: event.dailyWindowStart,
          end: event.dailyWindowEnd,
          graceMinutes
        }
      }, { status: 400 })
    }

    const existingAttendance = await Attendance.findOne({
      user: session.user.id,
      event: eventId,
      date
    })

    if (existingAttendance) {
      return NextResponse.json({ 
        ok: true,
        duplicated: true,
        message: 'Already checked in for today'
      })
    }

    const attendance = await Attendance.create({
      user: session.user.id,
      event: eventId,
      date,
      method
    })

    return NextResponse.json({ 
      ok: true,
      duplicated: false,
      attendance: {
        id: attendance._id,
        date: attendance.date,
        method: attendance.method
      }
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/checkin error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}