import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { dbConnect } from '@/lib/mongoose'
import { Group } from '@/models/Group'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      const demoGroups = [
        { _id: 'demo-group-1', name: '夏休みラジオ体操の会', code: 'DEMO2024', owner: 'demo-admin-1' }
      ]
      console.log('Demo mode: Returning demo groups')
      return NextResponse.json({ groups: demoGroups })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      // デモグループを返す（本番ではDBが接続されていないため）
      const demoGroups = [
        { _id: 'demo-group-1', name: '夏休みラジオ体操の会', code: 'DEMO2024', owner: 'demo-admin-1' }
      ]
      console.log('No session: Returning demo groups for demo mode')
      return NextResponse.json({ groups: demoGroups })
    }

    // 誰でもグループ表示可能にする（権限チェックを削除）

    const groups = await Group.find({})
      .select('name code owner')
      .sort('name')

    return NextResponse.json({ groups })
  } catch (error) {
    console.error('GET /api/groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const body = await req.json()
    const { name, code } = body
    
    const connection = await dbConnect()
    
    // デモモード
    if (!connection) {
      console.log('Demo mode: Simulating group creation')
      const newGroup = {
        _id: 'demo-group-' + Date.now(),
        name: name || 'デモグループ',
        code: code || 'DEMO' + Date.now(),
        owner: 'demo-admin-1'
      }
      return NextResponse.json({ group: newGroup }, { status: 201 })
    }
    
    // デモセッションの場合はセッションチェックをスキップ
    if (!session?.user?.id) {
      console.log('No session: Creating demo group')
      const newGroup = {
        _id: 'demo-group-' + Date.now(),
        name: name || 'デモグループ',
        code: code || 'DEMO' + Date.now(),
        owner: 'demo-admin-1'
      }
      return NextResponse.json({ group: newGroup }, { status: 201 })
    }

    // 誰でもグループ作成可能にする（権限チェックを削除）

    const group = await Group.create({
      name,
      code,
      owner: session.user.id
    })

    return NextResponse.json({ group }, { status: 201 })
  } catch (error) {
    console.error('POST /api/groups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}