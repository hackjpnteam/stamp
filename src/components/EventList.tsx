'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import RainbowFrame from './RainbowFrame'

export default function EventList() {
  const { data: session } = useSession()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [registrations, setRegistrations] = useState<{[eventId: string]: any[]}>({})
  const [userRegistrations, setUserRegistrations] = useState<{[eventId: string]: boolean}>({})
  const [registering, setRegistering] = useState<{[eventId: string]: boolean}>({})

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    // イベントが読み込まれたら参加予定も取得
    if (events.length > 0) {
      events.forEach(event => {
        fetchRegistrations(event._id)
      })
    }
  }, [events])

  useEffect(() => {
    // ローカルストレージから登録状態を読み込み
    if (typeof window !== 'undefined') {
      const savedRegistrations = JSON.parse(localStorage.getItem('userRegistrations') || '{}')
      setUserRegistrations(savedRegistrations)
    }
  }, [])

  // 現在のユーザー情報を取得
  const getCurrentUser = () => {
    if (session?.user) {
      // ローカルストレージから表示名を取得
      let displayName = session.user.name || 'ユーザー'
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userProfile')
        if (saved) {
          const localProfile = JSON.parse(saved)
          displayName = localProfile.displayName || displayName
        }
      }
      
      return {
        id: session.user.id || 'demo-user-1',
        name: displayName,
        email: session.user.email
      }
    } else {
      return {
        id: 'demo-user-1',
        name: 'デモユーザー',
        email: 'demo@example.com'
      }
    }
  }

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      console.log('Fetched events:', data.events)
      
      // デモモードの場合、ローカルストレージからも読み取る
      if (typeof window !== 'undefined') {
        const localEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
        
        // APIからのイベントとローカルイベントをマージ（重複削除）
        const allEvents = [...(data.events || []), ...localEvents]
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e._id === event._id)
        )
        
        // 開催日でソート（最新が上）
        const sortedEvents = uniqueEvents.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        
        setEvents(sortedEvents)
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
    } finally {
      setLoading(false)
    }
  }

  const fetchRegistrations = async (eventId: string) => {
    try {
      const res = await fetch(`/api/register?eventId=${eventId}`)
      const data = await res.json()
      
      if (res.ok) {
        let registrations = data.registrations || []
        
        // ローカルストレージから現在のユーザーの登録状態を確認
        if (typeof window !== 'undefined') {
          const savedRegistrations = JSON.parse(localStorage.getItem('userRegistrations') || '{}')
          const currentUser = getCurrentUser()
          
          if (savedRegistrations[eventId]) {
            // ユーザーが登録済みの場合、リストに追加（重複チェック）
            const alreadyInList = registrations.some((reg: any) => reg.userId === currentUser.id)
            
            if (!alreadyInList) {
              registrations = [
                { _id: 'user-reg-' + eventId, eventId, userId: currentUser.id, userName: currentUser.name, registeredAt: new Date() },
                ...registrations
              ]
            }
          } else {
            // ユーザーが登録していない場合、リストから削除
            registrations = registrations.filter((reg: any) => reg.userId !== currentUser.id)
          }
        }
        
        setRegistrations(prev => ({
          ...prev,
          [eventId]: registrations
        }))
        
        // 現在のユーザーが登録済みかチェック
        const currentUser = getCurrentUser()
        const isRegistered = registrations.some((reg: any) => reg.userId === currentUser.id)
        setUserRegistrations(prev => ({
          ...prev,
          [eventId]: isRegistered
        }))
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error)
    }
  }

  const handleRegistration = async (eventId: string, action: 'register' | 'unregister') => {
    setRegistering(prev => ({ ...prev, [eventId]: true }))
    const currentUser = getCurrentUser()
    
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action })
      })
      
      if (res.ok) {
        // 即座にローカル状態を更新
        const newRegistrationState = action === 'register'
        
        // 参加者リストも即座に更新
        setRegistrations(prev => {
          const currentRegistrations = prev[eventId] || []
          let updatedRegistrations
          
          if (action === 'register') {
            // 既存のユーザーを削除してから追加（重複防止）
            const filteredRegistrations = currentRegistrations.filter(reg => reg.userId !== currentUser.id)
            updatedRegistrations = [
              { _id: 'user-reg-' + eventId, eventId, userId: currentUser.id, userName: currentUser.name, registeredAt: new Date() },
              ...filteredRegistrations
            ]
          } else {
            // ユーザーを削除
            updatedRegistrations = currentRegistrations.filter(reg => reg.userId !== currentUser.id)
          }
          
          return {
            ...prev,
            [eventId]: updatedRegistrations
          }
        })
        
        setUserRegistrations(prev => {
          const newState = {
            ...prev,
            [eventId]: newRegistrationState
          }
          // ローカルストレージに保存
          if (typeof window !== 'undefined') {
            localStorage.setItem('userRegistrations', JSON.stringify(newState))
            
            // 登録履歴も保存（最新登録ユーザー表示用）
            if (action === 'register') {
              const registrationHistory = JSON.parse(localStorage.getItem('userRegistrationHistory') || '[]')
              const currentEvent = events.find(e => e._id === eventId)
              const newEntry = {
                userId: currentUser.id,
                name: currentUser.name,
                registeredAt: new Date().toISOString(),
                eventTitle: currentEvent?.title || 'イベント'
              }
              
              // 最新を先頭に追加し、最大10件まで保持
              const updatedHistory = [newEntry, ...registrationHistory.filter((entry: any) => 
                !(entry.userId === currentUser.id && entry.eventTitle === newEntry.eventTitle)
              )].slice(0, 10)
              
              localStorage.setItem('userRegistrationHistory', JSON.stringify(updatedHistory))
            }
          }
          return newState
        })
        
        if (action === 'register') {
          alert('✅ 参加予定に登録しました！')
        } else {
          alert('ℹ️ 参加予定から削除しました')
        }
      } else {
        alert('❌ 操作に失敗しました')
      }
    } catch (error) {
      alert('❌ ネットワークエラーが発生しました')
    } finally {
      setRegistering(prev => ({ ...prev, [eventId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-500 mt-2">イベントを読み込み中...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">まだイベントが作成されていません</p>
        <p className="text-sm text-gray-400">管理者がイベントを作成するとここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📅 開催中・予定のイベント</h2>
      
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
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    isToday ? 'bg-green-500 text-white animate-pulse' :
                    isUpcoming ? 'bg-blue-500 text-white' :
                    'bg-gray-500 text-white'
                  }`}>
                    {isToday ? '🔴 本日開催' : isUpcoming ? '📅 開催予定' : '✅ 終了'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📅</span>
                    <div>
                      <p className="font-semibold text-gray-700">開催日</p>
                      <p className="text-gray-600">{eventDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">⏰</span>
                    <div>
                      <p className="font-semibold text-gray-700">時間</p>
                      <p className="text-gray-600">{event.dailyWindowStart} 〜 {event.dailyWindowEnd}</p>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-red-600">📍</span>
                      <div>
                        <p className="font-semibold text-gray-700">場所</p>
                        <p className="text-gray-600">{event.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {event.mapUrl && (
                  <div className="mt-3">
                    <a 
                      href={event.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm"
                    >
                      🗺️ Googleマップで場所を確認
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              
              <div className="ml-6 flex flex-col gap-3">
                {/* 参加予定ボタン */}
                <button
                  onClick={() => handleRegistration(event._id, userRegistrations[event._id] ? 'unregister' : 'register')}
                  disabled={registering[event._id]}
                  className={`px-4 py-2 rounded-lg transition text-sm font-semibold ${
                    userRegistrations[event._id]
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  } disabled:bg-gray-300`}
                >
                  {registering[event._id] ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      処理中...
                    </div>
                  ) : userRegistrations[event._id] ? (
                    '📝 参加予定取消'
                  ) : (
                    '📝 参加予定'
                  )}
                </button>

                {/* チェックインボタン（当日のみ表示） */}
                {isToday && (
                  <Link
                    href={`/events/${event._id}`}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold text-center"
                  >
                    📱 チェックイン
                  </Link>
                )}

                {/* 参加予定者数表示 */}
                <div className="text-center text-xs text-gray-600">
                  <span className="font-semibold">参加予定:</span>
                  <span className="ml-1 text-blue-600 font-bold">
                    {registrations[event._id]?.length || 0}人
                  </span>
                </div>

                {/* 参加予定者一覧（最大3名まで表示） */}
                {registrations[event._id] && registrations[event._id].length > 0 && (
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">参加予定者</div>
                    <div className="space-y-2">
                      {registrations[event._id].slice(0, 3).map((reg: any) => {
                        const currentUser = getCurrentUser()
                        const isCurrentUser = reg.userId === currentUser.id
                        
                        return (
                          <div key={reg._id} className="flex items-center justify-center gap-2 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            <Link href={`/profile/${reg.userId}`} className="flex-shrink-0">
                              {isCurrentUser && session?.user?.image ? (
                                <img 
                                  src={session.user.image} 
                                  alt={reg.userName}
                                  className="w-5 h-5 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
                                />
                              ) : (
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-blue-500 transition cursor-pointer">
                                  L
                                </div>
                              )}
                            </Link>
                            <Link href={`/profile/${reg.userId}`} className="hover:text-blue-600 transition cursor-pointer">
                              {reg.userName}
                            </Link>
                          </div>
                        )
                      })}
                      {registrations[event._id].length > 3 && (
                        <div className="text-xs text-gray-500">
                          他{registrations[event._id].length - 3}人
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {isToday && (
                  <div className="text-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                    <p className="text-xs text-green-600 font-semibold mt-1">今すぐ参加!</p>
                  </div>
                )}
              </div>
            </div>
          </RainbowFrame>
        )
      })}
    </div>
  )
}