'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Event {
  _id: string
  title: string
  startDate: string
  endDate: string
  group: {
    _id: string
    name: string
  }
}

interface Attendance {
  date: string
  method: string
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [attendances, setAttendances] = useState<Record<string, Attendance[]>>({})
  const [ranking, setRanking] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [demoSession, setDemoSession] = useState<any>(null)

  useEffect(() => {
    // クライアントサイドでデモセッションをチェック
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('demoSession')
      if (stored) {
        try {
          setDemoSession(JSON.parse(stored))
        } catch (e) {
          localStorage.removeItem('demoSession')
        }
      }
    }
  }, [])

  useEffect(() => {
    // デモセッションがない場合のみ認証チェック
    if (!demoSession && status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router, demoSession])

  useEffect(() => {
    // セッションまたはデモセッションがある場合はデータを取得
    if (session || demoSession) {
      fetchData()
    }
  }, [session, demoSession])

  const fetchData = async () => {
    try {
      const [eventsRes, rankingRes] = await Promise.all([
        fetch('/api/events'),
        fetch('/api/ranking')
      ])
      
      const eventsData = await eventsRes.json()
      const rankingData = await rankingRes.json()
      
      setEvents(eventsData.events || [])
      setRanking(rankingData.ranking || [])

      // Fetch attendances for each event
      const attendanceData: Record<string, Attendance[]> = {}
      for (const event of eventsData.events || []) {
        const res = await fetch(`/api/attendances?eventId=${event._id}`)
        if (res.ok) {
          const data = await res.json()
          attendanceData[event._id] = data.attendances || []
        }
      }
      setAttendances(attendanceData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateDateRange = (start: string, end: string) => {
    const dates: string[] = []
    const current = new Date(start)
    const endDate = new Date(end)
    
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            ダッシュボード
          </h1>
          <p className="text-gray-600">
            {session?.user?.name || demoSession?.user?.name || 'ユーザー'}さんのスタンプカード
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">参加中のイベントはありません</p>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map(event => {
              const dates = generateDateRange(event.startDate, event.endDate)
              const eventAttendances = attendances[event._id] || []
              const attendedDates = new Set(eventAttendances.map(a => a.date))
              
              return (
                <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {event.title}
                    </h2>
                    <p className="text-gray-600">
                      {event.group.name} • {dates.length}日間
                    </p>
                  </div>

                  <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 mb-6">
                    {dates.map((date, index) => {
                      const isAttended = attendedDates.has(date)
                      const isToday = date === new Date().toISOString().split('T')[0]
                      
                      return (
                        <div
                          key={date}
                          className={`
                            aspect-square rounded-full flex items-center justify-center text-xs font-semibold
                            ${isAttended 
                              ? 'bg-green-500 text-white' 
                              : isToday
                                ? 'bg-yellow-100 border-2 border-yellow-400 text-gray-700'
                                : 'bg-gray-100 text-gray-400'
                            }
                          `}
                          title={date}
                        >
                          {isAttended ? '✓' : index + 1}
                        </div>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      出席: {eventAttendances.length} / {dates.length}日
                      <span className="ml-2">
                        ({Math.round((eventAttendances.length / dates.length) * 100)}%)
                      </span>
                    </div>
                    <Link
                      href={`/events/${event._id}`}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm"
                    >
                      イベント詳細
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* スタンプランキング */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🏆 スタンプランキング
          </h2>
          <div className="space-y-2">
            {ranking.slice(0, 10).map((user, index) => (
              <div 
                key={user.userId} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border border-gray-200' :
                  index === 2 ? 'bg-orange-50 border border-orange-200' :
                  'bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-500 text-white' :
                    'bg-blue-500 text-white'
                  }`}>
                    {user.rank}
                  </span>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    {index < 3 && (
                      <p className="text-xs text-gray-500">
                        {index === 0 ? '🥇 1位' : index === 1 ? '🥈 2位' : '🥉 3位'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{user.stamps}</p>
                  <p className="text-xs text-gray-500">スタンプ</p>
                </div>
              </div>
            ))}
            {ranking.length === 0 && (
              <p className="text-gray-500 text-center py-4">まだデータがありません</p>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-600 transition"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}