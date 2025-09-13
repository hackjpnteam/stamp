// デモ用のサンプルデータ

export const demoUser = {
  id: 'demo-user-1',
  name: 'デモユーザー',
  email: 'demo@example.com',
  role: 'member' as const
}

export const demoAdminUser = {
  id: 'demo-admin-1', 
  name: '管理者デモ',
  email: 'admin@demo.com',
  role: 'admin' as const
}

export const demoGroup = {
  _id: 'demo-group-1',
  name: '夏休みラジオ体操の会',
  code: 'DEMO2024',
  owner: demoAdminUser.id
}

export const demoEvents = [
  {
    _id: 'demo-event-1',
    title: '夏休みラジオ体操 2024',
    group: demoGroup,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    dailyWindowStart: '06:00',
    dailyWindowEnd: '09:00',
    requireQr: true,
    createdBy: demoAdminUser.id
  }
]

export const demoAttendances = [
  { date: new Date().toISOString().split('T')[0], method: 'qr' },
  { date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], method: 'qr' },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], method: 'manual' }
]

export const demoRewards = [
  {
    _id: 'demo-reward-1',
    name: '参加賞（文房具セット）',
    requiredStamps: 5,
    stock: 100,
    group: demoGroup._id
  },
  {
    _id: 'demo-reward-2',
    name: '努力賞（図書カード500円）',
    requiredStamps: 15,
    stock: 50,
    group: demoGroup._id
  },
  {
    _id: 'demo-reward-3',
    name: '皆勤賞（図書カード1000円）',
    requiredStamps: 31,
    stock: 20,
    group: demoGroup._id
  }
]

export const demoRedemptions = [
  {
    _id: 'demo-redemption-1',
    user: { name: '田中太郎', email: 'tanaka@demo.com' },
    reward: { name: '参加賞（文房具セット）' },
    status: 'requested'
  },
  {
    _id: 'demo-redemption-2', 
    user: { name: '鈴木花子', email: 'suzuki@demo.com' },
    reward: { name: '努力賞（図書カード500円）' },
    status: 'approved'
  }
]

export const demoStats = {
  eventId: 'demo-event-1',
  eventTitle: '夏休みラジオ体操 2024',
  totalDays: 31,
  totalAttendances: 95,
  uniqueUsers: 15,
  averageAttendanceRate: 65.5,
  perfectAttendanceCount: 3,
  perfectAttendanceUsers: [
    { id: 'user1', name: '田中太郎', email: 'tanaka@demo.com', attendanceCount: 31 },
    { id: 'user2', name: '鈴木花子', email: 'suzuki@demo.com', attendanceCount: 31 },
    { id: 'user3', name: '佐藤次郎', email: 'sato@demo.com', attendanceCount: 31 }
  ],
  ranking: [
    { userId: 'user1', name: '田中太郎', email: 'tanaka@demo.com', attendanceCount: 31, attendanceRate: 100 },
    { userId: 'user2', name: '鈴木花子', email: 'suzuki@demo.com', attendanceCount: 31, attendanceRate: 100 },
    { userId: 'user3', name: '佐藤次郎', email: 'sato@demo.com', attendanceCount: 31, attendanceRate: 100 },
    { userId: 'user4', name: '山田花子', email: 'yamada@demo.com', attendanceCount: 28, attendanceRate: 90.3 },
    { userId: 'user5', name: '高橋一郎', email: 'takahashi@demo.com', attendanceCount: 25, attendanceRate: 80.6 }
  ]
}