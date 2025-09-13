import mongoose from 'mongoose'
import { User } from '../src/models/User'
import { Group } from '../src/models/Group'
import { Event } from '../src/models/Event'
import { Reward } from '../src/models/Reward'
import { RuleConfig } from '../src/models/RuleConfig'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!)
    console.log('Connected to MongoDB')

    // Clear existing data
    await User.deleteMany({})
    await Group.deleteMany({})
    await Event.deleteMany({})
    await Reward.deleteMany({})
    await RuleConfig.deleteMany({})
    console.log('Cleared existing data')

    // Create owner user
    const owner = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'owner',
      groups: []
    })
    console.log('Created owner user')

    // Create group
    const group = await Group.create({
      name: '夏休みラジオ体操の会',
      code: 'SUMMER2024',
      owner: owner._id
    })
    console.log('Created group')

    // Update owner with group
    owner.groups = [new mongoose.Types.ObjectId(group._id as string)]
    await owner.save()

    // Create event
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30)
    
    const event = await Event.create({
      title: '夏休みラジオ体操 2024',
      group: group._id,
      startDate,
      endDate,
      dailyWindowStart: '06:00',
      dailyWindowEnd: '09:00',
      requireQr: true,
      createdBy: owner._id
    })
    console.log('Created event')

    // Create rewards
    const rewards = await Reward.create([
      {
        group: group._id,
        name: '参加賞（文房具セット）',
        requiredStamps: 5,
        stock: 100
      },
      {
        group: group._id,
        name: '努力賞（図書カード500円）',
        requiredStamps: 15,
        stock: 50
      },
      {
        group: group._id,
        name: '皆勤賞（図書カード1000円）',
        requiredStamps: 31,
        stock: 20
      }
    ])
    console.log('Created rewards')

    // Create rule config
    const ruleConfig = await RuleConfig.create({
      group: group._id,
      allowMultiplePerDay: false,
      graceMinutes: 15,
      perfectAttendanceBadge: true
    })
    console.log('Created rule config')

    // Create sample members
    const members = await User.create([
      {
        name: '田中太郎',
        email: 'tanaka@example.com',
        role: 'member',
        groups: [new mongoose.Types.ObjectId(group._id as string)]
      },
      {
        name: '鈴木花子',
        email: 'suzuki@example.com',
        role: 'member',
        groups: [new mongoose.Types.ObjectId(group._id as string)]
      },
      {
        name: '佐藤次郎',
        email: 'sato@example.com',
        role: 'admin',
        groups: [new mongoose.Types.ObjectId(group._id as string)]
      }
    ])
    console.log('Created sample members')

    console.log('\n===== Seed Complete =====')
    console.log('Owner credentials:')
    console.log('  Email: admin@example.com')
    console.log('  Role: owner')
    console.log('\nGroup:')
    console.log('  Name:', group.name)
    console.log('  Code:', group.code)
    console.log('\nEvent:')
    console.log('  Title:', event.title)
    console.log('  Period:', `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`)
    console.log('  Daily Window: 06:00 - 09:00 JST')
    console.log('\nRewards created:', rewards.length)
    console.log('Sample members created:', members.length)
    console.log('========================\n')

  } catch (error) {
    console.error('Seed error:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

// Run seed
seed()