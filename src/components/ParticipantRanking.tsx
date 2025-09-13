'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import RainbowFrame from './RainbowFrame'

interface RankingUser {
  userId: string
  name: string
  stamps: number
  rank: number
}

export default function ParticipantRanking() {
  const { data: session } = useSession()
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRanking()
  }, [])

  const fetchRanking = async () => {
    try {
      const res = await fetch('/api/ranking')
      const data = await res.json()
      
      if (res.ok) {
        // トップ5のみ表示
        setRanking((data.ranking || []).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to fetch ranking:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${rank}位`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-600 bg-yellow-50'
      case 2: return 'text-gray-600 bg-gray-50'
      case 3: return 'text-orange-600 bg-orange-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  if (loading) {
    return (
      <RainbowFrame background="white">
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
          <p className="text-gray-500 mt-2 text-sm">ランキング読み込み中...</p>
        </div>
      </RainbowFrame>
    )
  }

  return (
    <RainbowFrame background="white">
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          🏆 参加者ランキング
        </h3>
        
        {ranking.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 text-sm">参加者データがありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((user) => (
              <div key={user.userId} className={`flex items-center gap-3 p-3 rounded-lg ${getRankColor(user.rank)}`}>
                <div className="flex-shrink-0 w-12 text-center">
                  {user.rank <= 3 ? (
                    <span className="text-2xl">{getRankIcon(user.rank)}</span>
                  ) : (
                    <span className="text-sm font-bold">{user.rank}位</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2 flex-1">
                  <Link href={`/profile/${user.userId}`} className="flex-shrink-0">
                    {(session?.user as any)?.image && user.userId === (session?.user.id || 'demo-user-1') ? (
                      <img 
                        src={(session?.user as any)?.image} 
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover hover:ring-2 hover:ring-blue-500 transition cursor-pointer"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold hover:ring-2 hover:ring-blue-500 transition cursor-pointer">
                        L
                      </div>
                    )}
                  </Link>
                  <Link href={`/profile/${user.userId}`} className="font-semibold text-gray-800 hover:text-blue-600 transition cursor-pointer">
                    {user.name}
                  </Link>
                </div>
                
                <div className="flex items-center gap-1 text-right">
                  <span className="text-xl">🏃</span>
                  <div>
                    <div className="text-lg font-bold text-gray-800">{user.stamps}</div>
                    <div className="text-xs text-gray-500">スタンプ</div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* 自分のランキング表示 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">あなたのランキング</p>
                <div className="flex items-center justify-center gap-2 p-2 bg-blue-100 rounded-lg">
                  {(session?.user as any)?.image ? (
                    <img 
                      src={(session?.user as any)?.image} 
                      alt={session?.user?.name || 'ユーザー'}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      L
                    </div>
                  )}
                  <span className="font-semibold text-gray-800">
                    {session?.user?.name || 'デモユーザー'}
                  </span>
                  <span className="text-sm text-gray-600">- 3スタンプ</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </RainbowFrame>
  )
}