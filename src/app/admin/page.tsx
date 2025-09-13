'use client'

import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AuthButtons from '@/components/AuthButtons'

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
  
  // Database reset state
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (status === 'loading') {
      // ロード中は何もしない
      return
    }
    
    if (status === 'unauthenticated') {
      // 未ログインの場合はそのまま（ログイン画面を表示）
      return
    } 
    
    if (session) {
      // 認証済み - 開発環境では管理者として扱い、本番では厳密チェック
      const userRole = (session.user as any)?.role || 'member'
      const isAdmin = userRole === 'admin' || userRole === 'owner'
      
      console.log('Admin page auth check:', { 
        userRole, 
        isAdmin, 
        environment: process.env.NODE_ENV 
      })
      
      // 本番環境でのみ厳密な権限チェック
      if (process.env.NODE_ENV === 'production' && !isAdmin) {
        alert('管理者権限が必要です')
        router.push('/')
      }
      // 開発環境または管理者の場合は管理画面を表示
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

  const resetDatabase = async () => {
    const confirmed = confirm(
      '⚠️ 警告: データベースを完全にリセットします\n\n' +
      '• 全ユーザーデータ（管理者以外）\n' +
      '• 全イベントデータ\n' +
      '• 全参加記録データ\n\n' +
      'この操作は取り消しできません。本当に実行しますか？'
    )
    
    if (!confirmed) return

    const doubleConfirm = prompt(
      'データベースリセットを実行するには「RESET」と入力してください:'
    )
    
    if (doubleConfirm !== 'RESET') {
      alert('キャンセルされました')
      return
    }

    setIsResetting(true)
    
    try {
      const res = await fetch('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const data = await res.json()
      
      if (res.ok) {
        alert(
          '✅ データベースリセット完了\n\n' +
          `削除されたデータ:\n` +
          `• ユーザー: ${data.deletedCounts.users}件\n` +
          `• イベント: ${data.deletedCounts.events}件\n` +
          `• 参加記録: ${data.deletedCounts.attendances}件\n\n` +
          '管理者ユーザーは再作成されました。\nページを更新します。'
        )
        // データを再読み込み
        fetchData()
      } else {
        alert(`❌ リセット失敗: ${data.error}`)
      }
    } catch (error) {
      alert('❌ リセット処理でエラーが発生しました')
      console.error('Database reset error:', error)
    } finally {
      setIsResetting(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">管理者認証確認中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                👑 管理者ログイン
              </h1>
              <p className="text-xl text-gray-600">
                朝から始まる物語 - 管理画面
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white p-6 rounded-2xl mb-6">
              <div className="text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h2 className="text-xl font-bold mb-2">管理者専用エリア</h2>
                <p className="text-purple-100 text-sm">
                  このページは管理者のみアクセス可能です
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  管理者アカウントでログイン
                </h3>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      console.log('管理者ログインを開始: LINE OAuth, redirect to /admin')
                      signIn('line', { 
                        callbackUrl: window.location.origin + '/admin',
                        redirect: true 
                      })
                    }}
                    className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                    </svg>
                    管理者LINEログイン
                  </button>
                  <p className="text-xs text-gray-500">
                    管理者権限を持つLINEアカウントでログインしてください
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-lg mb-3 text-gray-800">🛠️ 管理機能</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">📅</span>
                  <span>イベント作成・管理</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">👥</span>
                  <span>参加者管理・統計表示</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-500">📱</span>
                  <span>QRコード生成</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-orange-500">🏆</span>
                  <span>報酬・バッジ管理</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-500">⚙️</span>
                  <span>システム設定</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-red-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          {/* 管理者ヘッダー */}
          <div className="bg-gradient-to-r from-purple-600 to-red-600 text-white p-6 rounded-2xl mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(session?.user as any)?.image ? (
                  <img 
                    src={(session?.user as any)?.image} 
                    alt={session?.user?.name || 'Admin'}
                    className="w-16 h-16 rounded-full object-cover border-4 border-white"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white">
                    <span className="text-2xl font-bold">👑</span>
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold">管理者ダッシュボード</h1>
                  <p className="text-purple-100 flex items-center gap-2">
                    <span>👑</span>
                    <span>{session?.user?.name || 'システム管理者'}</span>
                  </p>
                  <p className="text-purple-200 text-sm">朝から始まる物語 - イベント・統計・システム管理</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 text-right">
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition text-sm"
                >
                  <span>🏠</span>
                  <span>ホームへ</span>
                </Link>
                <button
                  onClick={resetDatabase}
                  disabled={isResetting}
                  className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 px-4 py-2 rounded-lg transition text-sm text-white"
                >
                  <span>🗑️</span>
                  <span>{isResetting ? 'リセット中...' : 'DB リセット'}</span>
                </button>
              </div>
            </div>
          </div>
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
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                🏠 ホームページへ戻る
              </Link>
              <Link
                href="/auth"
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
              >
                👤 マイページへ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}