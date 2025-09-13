'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'events' | 'rewards' | 'redemptions' | 'stats' | 'users'>('events')
  
  // Events state
  const [events, setEvents] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [eventForm, setEventForm] = useState({
    title: '',
    group: '',
    startDate: '',
    endDate: '',
    dailyWindowStart: '06:00',
    dailyWindowEnd: '09:00',
    location: '',
    mapUrl: ''
  })
  const [groupForm, setGroupForm] = useState({
    name: '',
    code: ''
  })
  
  // Rewards state
  const [rewards, setRewards] = useState<any[]>([])
  const [rewardForm, setRewardForm] = useState({
    name: '',
    group: '',
    requiredStamps: 10,
    stock: -1
  })
  
  // Redemptions state
  const [redemptions, setRedemptions] = useState<any[]>([])
  
  // Stats state
  const [selectedEventId, setSelectedEventId] = useState('')
  const [stats, setStats] = useState<any>(null)
  
  // Users state
  const [users, setUsers] = useState<any[]>([])
  const [loginHistory, setLoginHistory] = useState<any[]>([])
  const [showLoginHistory, setShowLoginHistory] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (session && session.user?.role !== 'admin' && session.user?.role !== 'owner') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session, activeTab])

  const fetchData = async () => {
    try {
      if (activeTab === 'events') {
        const [eventsRes, groupsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/groups')
        ])
        const eventsData = await eventsRes.json()
        const groupsData = await groupsRes.json()
        setEvents(eventsData.events || [])
        setGroups(groupsData.groups || [])
      } else if (activeTab === 'rewards') {
        const res = await fetch('/api/rewards')
        const data = await res.json()
        setRewards(data.rewards || [])
      } else if (activeTab === 'redemptions') {
        const res = await fetch('/api/redemptions')
        const data = await res.json()
        setRedemptions(data.redemptions || [])
      } else if (activeTab === 'users') {
        const [usersRes, loginHistoryRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/users/login-history')
        ])
        const usersData = await usersRes.json()
        const loginHistoryData = await loginHistoryRes.json()
        setUsers(usersData.users || [])
        setLoginHistory(loginHistoryData.loginHistory || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      })
      
      if (res.ok) {
        alert('グループを作成しました')
        setGroupForm({ name: '', code: '' })
        fetchData()
      }
    } catch (error) {
      alert('グループの作成に失敗しました')
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventForm)
      })
      
      if (res.ok) {
        alert('イベントを作成しました')
        setEventForm({
          title: '',
          group: '',
          startDate: '',
          endDate: '',
          dailyWindowStart: '06:00',
          dailyWindowEnd: '09:00',
          location: '',
          mapUrl: ''
        })
        fetchData()
      }
    } catch (error) {
      alert('イベントの作成に失敗しました')
    }
  }

  const createReward = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardForm)
      })
      
      if (res.ok) {
        alert('景品を作成しました')
        setRewardForm({
          name: '',
          group: '',
          requiredStamps: 10,
          stock: -1
        })
        fetchData()
      }
    } catch (error) {
      alert('景品の作成に失敗しました')
    }
  }

  const updateRedemption = async (redemptionId: string, status: string) => {
    try {
      const res = await fetch('/api/redemptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ redemptionId, status })
      })
      
      if (res.ok) {
        alert('ステータスを更新しました')
        fetchData()
      }
    } catch (error) {
      alert('ステータスの更新に失敗しました')
    }
  }

  const fetchStats = async () => {
    if (!selectedEventId) return
    
    try {
      const res = await fetch(`/api/stats?eventId=${selectedEventId}`)
      const data = await res.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">管理画面</h1>
          <p className="text-gray-600">イベント・景品・統計の管理</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg">
          <div className="border-b">
            <nav className="flex">
              {(['events', 'rewards', 'redemptions', 'stats', 'users'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-semibold transition ${
                    activeTab === tab
                      ? 'border-b-2 border-purple-500 text-purple-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {tab === 'events' && 'イベント'}
                  {tab === 'rewards' && '景品'}
                  {tab === 'redemptions' && '申請管理'}
                  {tab === 'stats' && '統計'}
                  {tab === 'users' && '参加者'}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'events' && (
              <div>
                <form onSubmit={createGroup} className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-bold mb-4">新規グループ作成</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="グループ名（例：夏休みラジオ体操の会）"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="グループコード（例：SUMMER2024）"
                      value={groupForm.code}
                      onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value.toUpperCase() })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    グループ作成
                  </button>
                </form>

                <form onSubmit={createEvent} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-4">新規イベント作成</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        イベント名 *
                      </label>
                      <input
                        type="text"
                        placeholder="例：夏休みラジオ体操 2024"
                        value={eventForm.title}
                        onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        グループ *
                      </label>
                      <select
                        value={eventForm.group}
                        onChange={(e) => setEventForm({ ...eventForm, group: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="">グループを選択してください</option>
                        {groups.map((group) => (
                          <option key={group._id} value={group._id}>
                            {group.name} ({group.code})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        開始日 *
                      </label>
                      <input
                        type="date"
                        value={eventForm.startDate}
                        onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        終了日 *
                      </label>
                      <input
                        type="date"
                        value={eventForm.endDate}
                        onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                        min={eventForm.startDate || new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        受付開始時間
                      </label>
                      <input
                        type="time"
                        value={eventForm.dailyWindowStart}
                        onChange={(e) => setEventForm({ ...eventForm, dailyWindowStart: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        チェックイン可能な開始時間（JST）
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        受付終了時間
                      </label>
                      <input
                        type="time"
                        value={eventForm.dailyWindowEnd}
                        onChange={(e) => setEventForm({ ...eventForm, dailyWindowEnd: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        チェックイン可能な終了時間（JST）
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        開催場所
                      </label>
                      <input
                        type="text"
                        placeholder="例：〇〇公園 中央広場"
                        value={eventForm.location}
                        onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        参加者が集合する場所を入力してください
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Googleマップ URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://maps.google.com/..."
                        value={eventForm.mapUrl}
                        onChange={(e) => setEventForm({ ...eventForm, mapUrl: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        参加者が場所を確認できるGoogleマップのリンクを貼り付けてください
                      </p>
                      {eventForm.mapUrl && (
                        <div className="mt-2">
                          <a
                            href={eventForm.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition"
                          >
                            🗺️ マップを確認する
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* プレビュー */}
                  {eventForm.title && eventForm.startDate && eventForm.endDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">📋 イベント情報プレビュー</h4>
                      <div className="text-sm text-blue-700">
                        <p><strong>イベント名:</strong> {eventForm.title}</p>
                        <p><strong>期間:</strong> {new Date(eventForm.startDate).toLocaleDateString()} 〜 {new Date(eventForm.endDate).toLocaleDateString()}</p>
                        <p><strong>受付時間:</strong> 毎日 {eventForm.dailyWindowStart} 〜 {eventForm.dailyWindowEnd} (JST)</p>
                        <p><strong>総日数:</strong> {Math.ceil((new Date(eventForm.endDate).getTime() - new Date(eventForm.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1}日間</p>
                        {eventForm.location && (
                          <p><strong>開催場所:</strong> {eventForm.location}</p>
                        )}
                        {eventForm.mapUrl && (
                          <p><strong>地図:</strong> <a href={eventForm.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Googleマップで確認</a></p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      type="submit"
                      disabled={!eventForm.title || !eventForm.group || !eventForm.startDate || !eventForm.endDate}
                      className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      📅 イベント作成
                    </button>
                    <button
                      type="button"
                      onClick={() => setEventForm({
                        title: '',
                        group: '',
                        startDate: '',
                        endDate: '',
                        dailyWindowStart: '06:00',
                        dailyWindowEnd: '09:00',
                        location: '',
                        mapUrl: ''
                      })}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      リセット
                    </button>
                  </div>
                </form>

                <div className="mb-4">
                  <h3 className="font-bold text-lg mb-2">作成済みイベント一覧</h3>
                  {events.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-lg">
                      <p className="text-gray-500 mb-2">まだイベントが作成されていません</p>
                      <p className="text-sm text-gray-400">上のフォームから最初のイベントを作成してください</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {events.map((event) => {
                        const startDate = new Date(event.startDate)
                        const endDate = new Date(event.endDate)
                        const today = new Date()
                        const isActive = startDate <= today && today <= endDate
                        const isUpcoming = startDate > today
                        const isFinished = endDate < today
                        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
                        
                        return (
                          <div key={event._id} className={`p-4 border rounded-lg ${
                            isActive ? 'border-green-200 bg-green-50' :
                            isUpcoming ? 'border-blue-200 bg-blue-50' :
                            'border-gray-200 bg-gray-50'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-lg">{event.title}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    isActive ? 'bg-green-500 text-white' :
                                    isUpcoming ? 'bg-blue-500 text-white' :
                                    'bg-gray-500 text-white'
                                  }`}>
                                    {isActive ? '開催中' : isUpcoming ? '開催予定' : '終了'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                                  <div>
                                    <span className="font-semibold">📅 期間:</span><br/>
                                    {startDate.toLocaleDateString()} 〜 {endDate.toLocaleDateString()} ({totalDays}日間)
                                  </div>
                                  <div>
                                    <span className="font-semibold">⏰ 受付時間:</span><br/>
                                    毎日 {event.dailyWindowStart} 〜 {event.dailyWindowEnd} (JST)
                                  </div>
                                  <div>
                                    <span className="font-semibold">👥 グループ:</span><br/>
                                    {event.group?.name || 'グループ名不明'}
                                  </div>
                                  <div>
                                    <span className="font-semibold">📊 ステータス:</span><br/>
                                    {isActive ? `進行中 (残り${Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}日)` :
                                     isUpcoming ? `開始まで${Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))}日` :
                                     '終了済み'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 ml-4">
                                <Link
                                  href={`/events/${event._id}`}
                                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm text-center"
                                >
                                  📱 QRコード
                                </Link>
                                {isActive && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        const res = await fetch(`/api/stats?eventId=${event._id}`)
                                        const data = await res.json()
                                        alert(`📊 ${event.title} の統計\n\n参加者数: ${data.stats?.uniqueUsers || 0}人\n総出席数: ${data.stats?.totalAttendances || 0}回\n平均出席率: ${data.stats?.averageAttendanceRate || 0}%`)
                                      } catch (error) {
                                        alert('統計データの取得に失敗しました')
                                      }
                                    }}
                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition text-xs"
                                  >
                                    📊 統計
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div>
                <form onSubmit={createReward} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-4">新規景品作成</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="景品名"
                      value={rewardForm.name}
                      onChange={(e) => setRewardForm({ ...rewardForm, name: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="text"
                      placeholder="グループID"
                      value={rewardForm.group}
                      onChange={(e) => setRewardForm({ ...rewardForm, group: e.target.value })}
                      className="px-4 py-2 border rounded-lg"
                      required
                    />
                    <input
                      type="number"
                      placeholder="必要スタンプ数"
                      value={rewardForm.requiredStamps}
                      onChange={(e) => setRewardForm({ ...rewardForm, requiredStamps: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="在庫数 (-1で無制限)"
                      value={rewardForm.stock}
                      onChange={(e) => setRewardForm({ ...rewardForm, stock: parseInt(e.target.value) })}
                      className="px-4 py-2 border rounded-lg"
                    />
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    作成
                  </button>
                </form>

                <div className="space-y-2">
                  {rewards.map((reward) => (
                    <div key={reward._id} className="p-4 border rounded-lg">
                      <h4 className="font-bold">{reward.name}</h4>
                      <p className="text-sm text-gray-600">
                        必要スタンプ: {reward.requiredStamps} | 在庫: {reward.stock === -1 ? '無制限' : reward.stock}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'redemptions' && (
              <div className="space-y-2">
                {redemptions.map((redemption: any) => (
                  <div key={redemption._id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold">{redemption.reward?.name}</h4>
                        <p className="text-sm text-gray-600">
                          申請者: {redemption.user?.name} | ステータス: {redemption.status}
                        </p>
                      </div>
                      {redemption.status === 'requested' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateRedemption(redemption._id, 'approved')}
                            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                          >
                            承認
                          </button>
                          <button
                            onClick={() => updateRedemption(redemption._id, 'rejected')}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            却下
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <div className="mb-4">
                  <select
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                    className="px-4 py-2 border rounded-lg mr-2"
                  >
                    <option value="">イベントを選択</option>
                    {events.map((event) => (
                      <option key={event._id} value={event._id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                  >
                    統計を表示
                  </button>
                </div>

                {stats && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-gray-600">平均出席率</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {stats.averageAttendanceRate}%
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-sm text-gray-600">皆勤賞</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.perfectAttendanceCount}人
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <p className="text-sm text-gray-600">参加者数</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {stats.uniqueUsers}人
                        </p>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-bold mb-2">出席ランキング</h4>
                      <div className="space-y-1">
                        {stats.ranking.map((user: any, index: number) => (
                          <div key={user.userId} className="flex justify-between text-sm">
                            <span>{index + 1}. {user.name}</span>
                            <span>{user.attendanceCount}日 ({user.attendanceRate.toFixed(1)}%)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold">参加者管理</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLoginHistory(false)}
                      className={`px-4 py-2 rounded transition ${
                        !showLoginHistory 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      参加者一覧
                    </button>
                    <button
                      onClick={() => setShowLoginHistory(true)}
                      className={`px-4 py-2 rounded transition ${
                        showLoginHistory 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      ログイン履歴
                    </button>
                  </div>
                </div>

                {!showLoginHistory ? (
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user._id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{user.name}</h4>
                            <p className="text-sm text-gray-600">
                              {user.email} | {user.role} | 登録日: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs ${
                              user.role === 'owner' ? 'bg-red-100 text-red-800' :
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'owner' ? 'オーナー' :
                               user.role === 'admin' ? '管理者' : '一般'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-gray-500 text-center py-4">参加者がいません</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-blue-800 mb-2">📊 ログイン履歴サマリー</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600">総ユーザー数</p>
                          <p className="font-bold text-lg">{loginHistory.length}</p>
                        </div>
                        <div>
                          <p className="text-blue-600">今日ログイン</p>
                          <p className="font-bold text-lg">
                            {loginHistory.filter(u => {
                              const today = new Date()
                              const lastLogin = new Date(u.lastLogin)
                              return lastLogin.toDateString() === today.toDateString()
                            }).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">今週ログイン</p>
                          <p className="font-bold text-lg">
                            {loginHistory.filter(u => {
                              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                              const lastLogin = new Date(u.lastLogin)
                              return lastLogin >= weekAgo
                            }).length}
                          </p>
                        </div>
                        <div>
                          <p className="text-blue-600">アクティブ率</p>
                          <p className="font-bold text-lg">
                            {loginHistory.length > 0 
                              ? Math.round((loginHistory.filter(u => {
                                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                                  return new Date(u.lastLogin) >= weekAgo
                                }).length / loginHistory.length) * 100)
                              : 0}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {loginHistory.map((user) => {
                      const lastLogin = new Date(user.lastLogin)
                      const now = new Date()
                      const diffHours = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60))
                      const isRecent = diffHours < 24
                      
                      return (
                        <div key={user._id} className={`p-4 border rounded-lg ${
                          isRecent ? 'border-green-200 bg-green-50' : ''
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold">{user.name}</h4>
                                {isRecent && (
                                  <span className="px-2 py-1 bg-green-500 text-white text-xs rounded">
                                    アクティブ
                                  </span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs ${
                                  user.role === 'owner' ? 'bg-red-100 text-red-800' :
                                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.role === 'owner' ? 'オーナー' :
                                   user.role === 'admin' ? '管理者' : '一般'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-500">
                                <div>
                                  <span className="font-semibold">最終ログイン:</span><br/>
                                  {diffHours < 1 ? '1時間以内' :
                                   diffHours < 24 ? `${diffHours}時間前` :
                                   diffHours < 24 * 7 ? `${Math.floor(diffHours / 24)}日前` :
                                   lastLogin.toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-semibold">登録日:</span><br/>
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-semibold">ログイン回数:</span><br/>
                                  {user.loginCount}回
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {loginHistory.length === 0 && (
                      <p className="text-gray-500 text-center py-4">ログイン履歴がありません</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/dashboard"
            className="text-blue-500 hover:text-blue-600 transition"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}