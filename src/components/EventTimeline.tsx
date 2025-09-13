'use client'

import { useState, useEffect } from 'react'
import RainbowFrame from './RainbowFrame'

interface TimelineEvent {
  _id: string
  title: string
  startDate: string
  dailyWindowStart: string
  dailyWindowEnd: string
  location?: string
  mapUrl?: string
  group: string
}

export default function EventTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentEvents()
  }, [])

  const fetchRecentEvents = async () => {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      
      // デモモードの場合、ローカルストレージからも読み取る
      if (typeof window !== 'undefined') {
        const localEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
        const allEvents = [...(data.events || []), ...localEvents]
        const uniqueEvents = allEvents.filter((event, index, self) => 
          index === self.findIndex(e => e._id === event._id)
        )
        
        // 直近7日間のイベントのみ表示
        const today = new Date()
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        const recentEvents = uniqueEvents.filter(event => {
          const eventDate = new Date(event.startDate)
          return eventDate >= sevenDaysAgo && eventDate <= sevenDaysFromNow
        })
        
        // 開催日順でソート（最新が上）
        const sortedEvents = recentEvents.sort((a, b) => 
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        
        setEvents(sortedEvents.slice(0, 5)) // 最大5件まで表示
      } else {
        const recentEvents = (data.events || []).slice(0, 5)
        setEvents(recentEvents)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
      // エラー時はローカルストレージから読み取り
      if (typeof window !== 'undefined') {
        const localEvents = JSON.parse(localStorage.getItem('demoEvents') || '[]')
        setEvents(localEvents.slice(0, 5))
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <RainbowFrame background="white">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">タイムライン読み込み中...</p>
        </div>
      </RainbowFrame>
    )
  }

  return (
    <RainbowFrame background="white">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⏰ 直近のイベントタイムライン
        </h3>
        
        {events.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">直近のイベントがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event, index) => {
              const eventDate = new Date(event.startDate)
              const today = new Date()
              const isToday = eventDate.toDateString() === today.toDateString()
              const isUpcoming = eventDate > today
              const isPast = eventDate < today
              
              return (
                <div key={event._id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      isToday ? 'bg-green-500 animate-pulse' :
                      isUpcoming ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 text-sm truncate">
                        {event.title}
                      </h4>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isToday ? 'bg-green-500 text-white' :
                        isUpcoming ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {isToday ? '本日' : isUpcoming ? '予定' : '終了'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>📅 {eventDate.toLocaleDateString()}</span>
                      <span>⏰ {event.dailyWindowStart}-{event.dailyWindowEnd}</span>
                      {event.location && (
                        <span className="truncate">📍 {event.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </RainbowFrame>
  )
}