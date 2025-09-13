'use client'

import { useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import RainbowFrame from '@/components/RainbowFrame'
import Link from 'next/link'

export default function UserProfilePage() {
  const params = useParams()
  const userId = params.userId as string
  const { data: session } = useSession()
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserProfile()
  }, [userId])

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`)
      const data = await res.json()
      
      if (res.ok) {
        let profile = data.user
        
        // 現在のユーザーの場合、ローカルストレージのプロフィール情報で上書き
        if (userId === session?.user?.id || userId === 'demo-user-1') {
          // ローカルストレージからプロフィール情報を取得
          if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('userProfile')
            if (saved) {
              const localProfile = JSON.parse(saved)
              if (localProfile.displayName) {
                profile.name = localProfile.displayName
              }
              if (localProfile.profileText) {
                profile.profileText = localProfile.profileText
              }
            }
          }
        }
        
        setUserProfile(profile)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const isOwnProfile = userId === 'demo-user-1' || userId === session?.user?.id

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">プロフィールを読み込み中...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!userProfile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-gray-600">ユーザーが見つかりません</p>
            <Link href="/auth" className="text-blue-600 hover:text-blue-800 transition mt-4 inline-block">
              マイページに戻る
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* 戻るボタン */}
          <div className="mb-6">
            <Link
              href="/auth"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
            >
              ← マイページに戻る
            </Link>
          </div>

          {/* プロフィールヘッダー */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
            <div className="flex items-center gap-4">
              {userProfile.image ? (
                <img 
                  src={userProfile.image} 
                  alt={userProfile.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white"
                />
              ) : (
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white">
                  <span className="text-2xl font-bold">L</span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">{userProfile.name}</h1>
                <p className="text-blue-100 flex items-center gap-2">
                  <span>⭐</span>
                  <span>{userProfile.level}</span>
                </p>
                <p className="text-blue-200 text-sm">
                  {userProfile.joinDate}から参加
                </p>
              </div>
            </div>
          </div>

          {/* 統計情報 */}
          <RainbowFrame background="white" className="rounded-t-none mb-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{userProfile.participationCount}</div>
                <div className="text-sm text-gray-600">参加回数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{userProfile.streak}</div>
                <div className="text-sm text-gray-600">連続参加</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{userProfile.badges.length}</div>
                <div className="text-sm text-gray-600">獲得バッジ</div>
              </div>
            </div>

            {/* プログレスバー */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>今年の参加進捗</span>
                <span>{userProfile.participationCount}/100回</span>
              </div>
              <div className="bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000"
                  style={{width: `${Math.min((userProfile.participationCount / 100) * 100, 100)}%`}}
                ></div>
              </div>
            </div>
          </RainbowFrame>

          {/* 自己紹介 */}
          {userProfile.profileText && (
            <RainbowFrame background="white" className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3">✨ 自己紹介</h2>
              <p className="text-gray-600 leading-relaxed">{userProfile.profileText}</p>
            </RainbowFrame>
          )}

          {/* 獲得バッジ */}
          {userProfile.badges.length > 0 && (
            <RainbowFrame background="white" className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">🏆 獲得バッジ</h2>
              <div className="flex flex-wrap gap-2">
                {userProfile.badges.map((badge, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-sm font-semibold"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </RainbowFrame>
          )}

          {/* 最近の参加履歴 */}
          {userProfile.recentHistory && userProfile.recentHistory.length > 0 && (
            <RainbowFrame background="white" className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">📅 最近の参加履歴</h2>
              <div className="space-y-3">
                {userProfile.recentHistory.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">{item.event}</div>
                      <div className="text-sm text-gray-600">{item.date} {item.time}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                      参加済み
                    </span>
                  </div>
                ))}
              </div>
            </RainbowFrame>
          )}

          {/* アクションボタン */}
          {!isOwnProfile && (
            <RainbowFrame background="white">
              <div className="text-center">
                <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mr-3">
                  メッセージを送る
                </button>
                <button className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                  一緒に参加する
                </button>
              </div>
            </RainbowFrame>
          )}

          {isOwnProfile && (
            <div className="text-center">
              <Link
                href="/auth"
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition inline-block"
              >
                プロフィールを編集
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}