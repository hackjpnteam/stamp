import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Redemption } from '@/models/Redemption'
import { Reward } from '@/models/Reward'
import { Attendance } from '@/models/Attendance'
import { Event } from '@/models/Event'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    let query: any = {}
    if (session.user.role === 'admin' || session.user.role === 'owner') {
      // Admins can see all redemptions
    } else {
      query.user = session.user.id
    }

    const redemptions = await Redemption.find(query)
      .populate('user')
      .populate('reward')
      .sort('-createdAt')

    return NextResponse.json({ redemptions })
  } catch (error) {
    console.error('GET /api/redemptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const body = await req.json()
    const { rewardId } = body

    const reward = await Reward.findById(rewardId)
    if (!reward) {
      return NextResponse.json({ error: 'Reward not found' }, { status: 404 })
    }

    // Check if user has enough stamps
    const events = await Event.find({ group: reward.group })
    const eventIds = events.map(e => e._id)
    
    const attendanceCount = await Attendance.countDocuments({
      user: session.user.id,
      event: { $in: eventIds }
    })

    if (attendanceCount < reward.requiredStamps) {
      return NextResponse.json({ 
        error: 'Not enough stamps',
        required: reward.requiredStamps,
        current: attendanceCount
      }, { status: 400 })
    }

    // Check stock
    if (reward.stock !== -1) {
      const approvedRedemptions = await Redemption.countDocuments({
        reward: rewardId,
        status: { $in: ['approved', 'fulfilled'] }
      })
      
      if (approvedRedemptions >= reward.stock) {
        return NextResponse.json({ error: 'Reward out of stock' }, { status: 400 })
      }
    }

    // Check for existing redemption
    const existingRedemption = await Redemption.findOne({
      user: session.user.id,
      reward: rewardId,
      status: { $in: ['requested', 'approved'] }
    })

    if (existingRedemption) {
      return NextResponse.json({ error: 'Already requested this reward' }, { status: 400 })
    }

    const redemption = await Redemption.create({
      user: session.user.id,
      reward: rewardId,
      status: 'requested'
    })

    return NextResponse.json({ redemption }, { status: 201 })
  } catch (error) {
    console.error('POST /api/redemptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin' && session.user.role !== 'owner') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await dbConnect()
    
    const body = await req.json()
    const { redemptionId, status } = body

    if (!['approved', 'rejected', 'fulfilled'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const redemption = await Redemption.findByIdAndUpdate(
      redemptionId,
      { status },
      { new: true }
    )

    if (!redemption) {
      return NextResponse.json({ error: 'Redemption not found' }, { status: 404 })
    }

    return NextResponse.json({ redemption })
  } catch (error) {
    console.error('PATCH /api/redemptions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}