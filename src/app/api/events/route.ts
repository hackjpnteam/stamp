import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Event } from '@/models/Event'
import { User } from '@/models/User'
import { demoEvents, demoUser } from '@/lib/demo-data'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Returning demo events')
      return NextResponse.json({ events: demoEvents })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Returning demo events for demo mode')
      return NextResponse.json({ events: demoEvents })
    }
    
    const user = await User.findById(session.user.id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const events = await Event.find({ 
      group: { $in: user.groups } 
    }).populate('group').sort('-createdAt')

    return NextResponse.json({ events })
  } catch (error) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { title, group, startDate, endDate, dailyWindowStart, dailyWindowEnd, requireQr, location, mapUrl } = body
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Simulating event creation')
      const newEvent = {
        _id: 'demo-event-' + Date.now(),
        title: title || 'デモイベント',
        group,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dailyWindowStart: dailyWindowStart || '06:00',
        dailyWindowEnd: dailyWindowEnd || '09:00',
        requireQr: requireQr !== false,
        location: location || '',
        mapUrl: mapUrl || '',
        createdBy: 'demo-admin-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return NextResponse.json({ event: newEvent }, { status: 201 })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Creating demo event')
      const newEvent = {
        _id: 'demo-event-' + Date.now(),
        title: title || 'デモイベント',
        group,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        dailyWindowStart: dailyWindowStart || '06:00',
        dailyWindowEnd: dailyWindowEnd || '09:00',
        requireQr: requireQr !== false,
        location: location || '',
        mapUrl: mapUrl || '',
        createdBy: 'demo-admin-1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return NextResponse.json({ event: newEvent }, { status: 201 })
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const event = await Event.create({
      title,
      group,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      dailyWindowStart: dailyWindowStart || '06:00',
      dailyWindowEnd: dailyWindowEnd || '09:00',
      requireQr: requireQr !== false,
      location: location || '',
      mapUrl: mapUrl || '',
      createdBy: session.user.id
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error('POST /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}