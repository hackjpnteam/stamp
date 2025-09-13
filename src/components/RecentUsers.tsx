'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import RainbowFrame from './RainbowFrame'

interface RecentUser {
  userId: string
  name: string
  registeredAt: string
  eventTitle?: string
}

export default function RecentUsers() {
  const { data: session } = useSession()
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentUsers()
  }, [])

  const fetchRecentUsers = async () => {
    try {
      // デモ用の直近登録ユーザーデータ
      const demoRecentUsers: RecentUser[] = [
        {
          userId: session?.user?.id || 'demo-user-1',
          name: session?.user?.name || 'デモユーザー',
          registeredAt: new Date().toISOString(),
          eventTitle: '散歩'
        },
        {
          userId: 'demo-user-4',
          name: '山田太郎',
          registeredAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5分前
          eventTitle: '夏休みラジオ体操 2024'
        },
        {
          userId: 'demo-user-5',
          name: '佐藤花子',
          registeredAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15分前
          eventTitle: '散歩'
        },
        {
          userId: 'demo-user-6',
          name: '田中次郎',
          registeredAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30分前
          eventTitle: '夏休みラジオ体操 2024'
        },
        {
          userId: 'demo-user-7',
          name: '鈴木美咲',
          registeredAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1時間前
          eventTitle: '散歩'
        }
      ]

      // ローカルストレージから実際の登録履歴も取得
      if (typeof window !== 'undefined') {
        const userRegistrations = JSON.parse(localStorage.getItem('userRegistrations') || '{}')
        const userRegistrationHistory = JSON.parse(localStorage.getItem('userRegistrationHistory') || '[]')
        
        // 実際の登録履歴があれば優先
        if (userRegistrationHistory.length > 0) {
          setRecentUsers([...userRegistrationHistory, ...demoRecentUsers].slice(0, 5))
        } else {
          setRecentUsers(demoRecentUsers)
        }
      } else {
        setRecentUsers(demoRecentUsers)
      }
    } catch (error) {
      console.error('Failed to fetch recent users:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const registeredAt = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - registeredAt.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'たった今'
    if (diffInMinutes < 60) return `${diffInMinutes}分前`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}時間前`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}日前`
  }

  if (loading) {
    return (
      <RainbowFrame background="white">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">直近登録ユーザー読み込み中...</p>
        </div>
      </RainbowFrame>
    )
  }

  return (
    <RainbowFrame background="white">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          👥 直近登録したユーザー
        </h3>
        
        {recentUsers.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">直近の登録ユーザーがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentUsers.map((user, index) => {
              const isCurrentUser = user.userId === (session?.user?.id || 'demo-user-1')
              
              return (
                <div key={user.userId + '-' + index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Link href={`/profile/${user.userId}`} className="flex-shrink-0">
                    {isCurrentUser && (session?.user as any)?.image ? (
                      <img 
                        src={(session?.user as any)?.image} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold hover:ring-2 hover:ring-blue-500 transition cursor-pointer">
                        L
                      </div>
                    )}
                  </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-800 text-sm">{user.name}</span>
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-semibold">
                        NEW
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span>⏰ {getTimeAgo(user.registeredAt)}</span>
                    {user.eventTitle && (
                      <span className="truncate">📅 {user.eventTitle}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex-shrink-0">
                  <span className="text-xl">🆕</span>
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