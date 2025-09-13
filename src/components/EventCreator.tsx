'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import RainbowFrame from './RainbowFrame'

export default function EventCreator() {
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [groups, setGroups] = useState<any[]>([])
  const [eventForm, setEventForm] = useState({
    title: '',
    group: '',
    eventDate: '',
    startTime: '06:00',
    duration: '1',
    location: '',
    mapUrl: ''
  })
  const [groupForm, setGroupForm] = useState({
    name: '',
    code: ''
  })
  const [loading, setLoading] = useState(false)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [events, setEvents] = useState<any[]>([])

  // デモセッションチェック
  const [demoSession, setDemoSession] = useState<any>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demoSession')
      if (stored) {
        try {
          setDemoSession(JSON.parse(stored))
        } catch (e) {
          localStorage.removeItem('demoSession')
        }
      }
      
      // 初期化時にローカルストレージからグループを読み込み
      const localGroups = JSON.parse(localStorage.getItem('demoGroups') || '[]')
      if (localGroups.length > 0) {
        setGroups(localGroups)
      }
    }
  }, [])

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'owner' || 
                  demoSession?.user?.role === 'admin' || demoSession?.user?.role === 'owner'
  
  console.log('Session:', session)
  console.log('Demo Session:', demoSession)
  console.log('Is Admin:', isAdmin)

  useEffect(() => {
    if (showForm && isAdmin) {
      fetchGroups()
      fetchEvents()
    }
  }, [showForm, isAdmin])

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups')
      const data = await res.json()
      console.log('Fetched groups from API:', data.groups)
      
      // デモモードの場合、ローカルストレージからも読み取る
      if (typeof window !== 'undefined') {
        const localGroups = JSON.parse(localStorage.getItem('demoGroups') || '[]')
        console.log('Local groups:', localGroups)
        
        // APIからのグループとローカルグループをマージ（重複削除）
        const allGroups = [...(data.groups || []), ...localGroups]
        const uniqueGroups = allGroups.filter((group, index, self) => 
          index === self.findIndex(g => g._id === group._id)
        )
        console.log('Combined groups:', uniqueGroups)
        setGroups(uniqueGroups)
      } else {
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Failed to fetch groups:', error)
      // エラー時はローカルストレージから読み取り
      if (typeof window !== 'undefined') {
        const localGroups = JSON.parse(localStorage.getItem('demoGroups') || '[]')
        setGroups(localGroups)
      }
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      console.log('Fetched events from API:', data.events)
      
      // デモモードの場合、ローカルストレージからも読み取る
      if (typeof window !== 'undefined') {
        const localEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
        console.log('Local events:', localEvents)
        
        // APIからのイベントとローカルイベントをマージ（重複削除）
        const allEvents = [...(data.events || []), ...localEvents]
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e._id === event._id)
        )
        console.log('Combined events:', uniqueEvents)
        setEvents(uniqueEvents)
      } else {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // エラー時はローカルストレージから読み取り
      if (typeof window !== 'undefined') {
        const localEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
        setEvents(localEvents)
      }
    }
  }

  const createGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupForm)
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log('Created group:', data.group)
        
        // デモモードでローカルストレージにグループを保存
        if (typeof window !== 'undefined') {
          const existingGroups = JSON.parse(localStorage.getItem('demoGroups') || '[]')
          const newGroups = [...existingGroups, data.group]
          localStorage.setItem('demoGroups', JSON.stringify(newGroups))
        }
        
        alert('✅ グループを作成しました！')
        setGroupForm({ name: '', code: '' })
        setShowGroupForm(false)
        // グループ一覧を再取得
        await fetchGroups()
        // 作成したグループを自動選択
        setEventForm(prev => ({ ...prev, group: data.group._id }))
      } else {
        const error = await res.json()
        alert(`❌ エラー: ${error.error || 'グループの作成に失敗しました'}`)
      }
    } catch (error) {
      alert('❌ グループの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // 新しいフォーム形式から従来のAPI形式に変換
      const [hours, minutes] = eventForm.startTime.split(':').map(Number)
      const durationHours = parseFloat(eventForm.duration)
      const endHours = Math.floor(hours + durationHours)
      const endMinutes = minutes + ((durationHours % 1) * 60)
      const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
      
      const apiData = {
        title: eventForm.title,
        group: eventForm.group,
        startDate: eventForm.eventDate,
        endDate: eventForm.eventDate, // 同じ日
        dailyWindowStart: eventForm.startTime,
        dailyWindowEnd: endTime,
        location: eventForm.location,
        mapUrl: eventForm.mapUrl,
        requireQr: true
      }
      
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log('Created event:', data.event)
        
        // デモモードでローカルストレージにイベントを保存
        if (typeof window !== 'undefined') {
          const existingEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
          const newEvents = [...existingEvents, data.event]
          localStorage.setItem('demoEvents', JSON.stringify(newEvents))
        }
        
        alert('✅ イベントを作成しました！')
        setEventForm({
          title: '',
          group: '',
          eventDate: '',
          startTime: '06:00',
          duration: '1',
          location: '',
          mapUrl: ''
        })
        // イベント一覧を再取得
        await fetchEvents()
        setShowForm(false)
      } else {
        const error = await res.json()
        alert(`❌ エラー: ${error.error || 'イベントの作成に失敗しました'}`)
      }
    } catch (error) {
      alert('❌ イベントの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // 管理者でない場合は何も表示しない
  if (!isAdmin) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">📅 イベント管理</h2>
          <p className="text-gray-600">新しいラジオ体操イベントを作成</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`px-6 py-3 rounded-lg transition ${
            showForm 
              ? 'bg-gray-300 text-gray-700 hover:bg-gray-400' 
              : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {showForm ? '✖️ 閉じる' : '➕ イベント作成'}
        </button>
      </div>

      {showForm && (
        <div className="border-t pt-6">
          {/* グループ作成/選択セクション */}
          <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">
                👥 グループ設定
              </h4>
              <p className="text-sm text-gray-600">
                イベントを開催するグループを選択または作成してください
              </p>
            </div>
            
            {groups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-3">まだグループが作成されていません</p>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                >
                  ➕ 最初のグループを作成
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={eventForm.group}
                  onChange={(e) => setEventForm({ ...eventForm, group: e.target.value })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">既存のグループを選択</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name} ({group.code})
                    </option>
                  ))}
                </select>
                <span className="text-gray-500">または</span>
                <button
                  type="button"
                  onClick={() => setShowGroupForm(true)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition whitespace-nowrap"
                >
                  ➕ 新規作成
                </button>
              </div>
            )}

            {showGroupForm && (
              <form onSubmit={createGroup} className="mt-4 p-4 bg-white rounded-lg border">
                <h5 className="font-semibold mb-3">新規グループ作成</h5>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      グループ名 *
                    </label>
                    <input
                      type="text"
                      placeholder="例：夏休みラジオ体操の会"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      グループコード *
                    </label>
                    <input
                      type="text"
                      placeholder="例：SUMMER2024"
                      value={groupForm.code}
                      onChange={(e) => setGroupForm({ ...groupForm, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      参加者が使用する識別コード
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    type="submit"
                    disabled={!groupForm.name || !groupForm.code || loading}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition disabled:bg-gray-300"
                  >
                    {loading ? '作成中...' : '👥 グループ作成'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupForm(false)
                      setGroupForm({ name: '', code: '' })
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* イベント作成フォーム */}
          <form onSubmit={createEvent}>
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
                  選択されたグループ
                </label>
                <div className="px-4 py-2 bg-gray-100 border rounded-lg">
                  {eventForm.group ? (
                    <span className="text-green-700 font-medium">
                      ✓ {groups.find(g => g._id === eventForm.group)?.name || 'グループが選択されています'}
                    </span>
                  ) : (
                    <span className="text-gray-500">上でグループを選択してください</span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開催日 *
                </label>
                <input
                  type="date"
                  value={eventForm.eventDate}
                  onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ラジオ体操を開催する日付
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  開始時間 *
                </label>
                <input
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  ラジオ体操の開始時間
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  所要時間（時間）
                </label>
                <select
                  value={eventForm.duration}
                  onChange={(e) => setEventForm({ ...eventForm, duration: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="0.5">30分</option>
                  <option value="1">1時間</option>
                  <option value="1.5">1時間30分</option>
                  <option value="2">2時間</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ラジオ体操の所要時間
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
            {eventForm.title && eventForm.eventDate && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">📋 プレビュー</h4>
                <div className="text-sm text-blue-700">
                  <p><strong>イベント名:</strong> {eventForm.title}</p>
                  <p><strong>開催日:</strong> {new Date(eventForm.eventDate).toLocaleDateString()}</p>
                  <p><strong>時間:</strong> {eventForm.startTime} 〜 {(() => {
                    const [hours, minutes] = eventForm.startTime.split(':').map(Number)
                    const durationHours = parseFloat(eventForm.duration)
                    const endHours = Math.floor(hours + durationHours)
                    const endMinutes = minutes + ((durationHours % 1) * 60)
                    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
                  })()} ({eventForm.duration}時間)</p>
                  {eventForm.location && (
                    <p><strong>開催場所:</strong> {eventForm.location}</p>
                  )}
                  {eventForm.mapUrl && (
                    <p><strong>地図:</strong> <a href={eventForm.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">Googleマップで確認</a></p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                disabled={!eventForm.title || !eventForm.group || !eventForm.eventDate || loading}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    作成中...
                  </>
                ) : (
                  <>📅 イベント作成</>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEventForm({
                    title: '',
                    group: '',
                    eventDate: '',
                    startTime: '06:00',
                    duration: '1',
                    location: '',
                    mapUrl: ''
                  })
                  setGroupForm({ name: '', code: '' })
                  setShowGroupForm(false)
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
              >
                リセット
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 作成したイベント一覧 */}
      {isAdmin && events.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">📋 作成済みイベント</h3>
          <div className="space-y-4">
            {events.map((event) => {
              const eventDate = new Date(event.startDate)
              const today = new Date()
              const isToday = eventDate.toDateString() === today.toDateString()
              const isUpcoming = eventDate > today
              const isPast = eventDate < today
              
              return (
                <RainbowFrame key={event._id} background="white">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg font-bold text-gray-800">{event.title}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          isToday ? 'bg-green-500 text-white' :
                          isUpcoming ? 'bg-blue-500 text-white' :
                          'bg-gray-500 text-white'
                        }`}>
                          {isToday ? '本日開催' : isUpcoming ? '開催予定' : '終了'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>
                          <span className="font-semibold">📅 開催日:</span><br/>
                          {eventDate.toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-semibold">⏰ 時間:</span><br/>
                          {event.dailyWindowStart} 〜 {event.dailyWindowEnd}
                        </div>
                        {event.location && (
                          <div>
                            <span className="font-semibold">📍 場所:</span><br/>
                            {event.location}
                          </div>
                        )}
                        {event.mapUrl && (
                          <div>
                            <span className="font-semibold">🗺️ 地図:</span><br/>
                            <a 
                              href={event.mapUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Googleマップで確認
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/events/${event._id}`}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                      >
                        📱 QRコード
                      </Link>
                    </div>
                  </div>
                </RainbowFrame>
              )
            })}
          </div>
        </div>
      )}

      {!showForm && !events.length && isAdmin && (
        <div className="text-center py-4 text-gray-500">
          <p>クリックしてイベントを作成してください</p>
        </div>
      )}
    </div>
  )
}