import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Reward } from '@/models/Reward'
import { User } from '@/models/User'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード  
    if (!connection) {
      const { demoRewards } = await import('@/lib/demo-data')
      console.log('Demo mode: Returning demo rewards')
      return NextResponse.json({ rewards: demoRewards })
    }
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const groupId = searchParams.get('groupId')
    
    let query = {}
    if (groupId) {
      query = { group: groupId }
    } else {
      const user = await User.findById(session.user.id)
      if (user && user.groups.length > 0) {
        query = { group: { $in: user.groups } }
      }
    }

    const rewards = await Reward.find(query).sort('requiredStamps')

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('GET /api/rewards error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
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
    const { group, name, requiredStamps, stock } = body

    const reward = await Reward.create({
      group,
      name,
      requiredStamps,
      stock: stock !== undefined ? stock : -1
    })

    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error('POST /api/rewards error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}