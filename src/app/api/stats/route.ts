import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Event } from '@/models/Event'
import { Attendance } from '@/models/Attendance'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      const { demoStats } = await import('@/lib/demo-data')
      console.log('Demo mode: Returning demo stats')
      return NextResponse.json({ stats: demoStats })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const eventId = searchParams.get('eventId')
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Calculate total possible days
    const startDate = new Date(event.startDate)
    const endDate = new Date(event.endDate)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

    // Get attendance stats
    const attendances = await Attendance.find({ event: eventId })
      .populate('user', 'name email')
    
    const userAttendanceMap = new Map<string, number>()
    attendances.forEach(att => {
      const userId = att.user._id.toString()
      userAttendanceMap.set(userId, (userAttendanceMap.get(userId) || 0) + 1)
    })

    // Calculate stats
    const totalAttendances = attendances.length
    const uniqueUsers = userAttendanceMap.size
    const averageAttendanceRate = uniqueUsers > 0 
      ? (totalAttendances / (uniqueUsers * totalDays)) * 100 
      : 0

    // Find perfect attendance users
    const perfectAttendanceUsers: any[] = []
    const userIds = Array.from(userAttendanceMap.keys())
    for (const userId of userIds) {
      const count = userAttendanceMap.get(userId)
      if (count === totalDays) {
        const user = await User.findById(userId)
        if (user) {
          perfectAttendanceUsers.push({
            id: user._id,
            name: user.name,
            email: user.email,
            attendanceCount: count
          })
        }
      }
    }

    // Create ranking
    const ranking = Array.from(userAttendanceMap.entries())
      .map(([userId, count]) => {
        const user = attendances.find(a => a.user._id.toString() === userId)?.user as any
        return {
          userId,
          name: user?.name || 'Unknown',
          email: user?.email || '',
          attendanceCount: count,
          attendanceRate: (count / totalDays) * 100
        }
      })
      .sort((a, b) => b.attendanceCount - a.attendanceCount)
      .slice(0, 10)

    return NextResponse.json({
      stats: {
        eventId,
        eventTitle: event.title,
        totalDays,
        totalAttendances,
        uniqueUsers,
        averageAttendanceRate: Math.round(averageAttendanceRate * 10) / 10,
        perfectAttendanceCount: perfectAttendanceUsers.length,
        perfectAttendanceUsers,
        ranking
      }
    })
  } catch (error) {
    console.error('GET /api/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}