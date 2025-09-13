'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import AuthButtons from '@/components/AuthButtons'
import RainbowFrame from '@/components/RainbowFrame'
import Link from 'next/link'

export default function AuthPage() {
  const { data: session } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [profileText, setProfileText] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // ローカルストレージから保存された情報を読み込み
  const getSavedProfile = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userProfile')
      if (saved) {
        const profile = JSON.parse(saved)
        return {
          displayName: profile.displayName || session?.user?.name || '',
          profileText: profile.profileText || ''
        }
      }
    }
    return {
      displayName: session?.user?.name || '',
      profileText: ''
    }
  }

  const savedProfile = getSavedProfile()

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      // ローカルストレージに保存
      if (typeof window !== 'undefined') {
        const profile = {
          displayName: displayName || session?.user?.name || '',
          profileText: profileText
        }
        localStorage.setItem('userProfile', JSON.stringify(profile))
      }
      
      setIsEditing(false)
      alert('プロフィールを保存しました！')
    } catch (error) {
      alert('保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (session) {
    // ログイン済み - マイページ表示
    return (
      <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                👤 マイページ
              </h1>
              <p className="text-xl text-gray-600">
                プロフィール・参加履歴・設定
              </p>
            </div>

            {/* プロフィール情報 */}
            <div className="bg-gradient-to-r from-gray-700 to-gray-600 text-white p-6 rounded-t-2xl mb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {(session.user as any)?.image ? (
                    <img 
                      src={(session.user as any).image} 
                      alt={session.user.name || 'ユーザー'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      L
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-bold">
                      {savedProfile.displayName || session.user?.name || 'ユーザー'}
                    </h2>
                    <p className="text-gray-300 text-sm flex items-center gap-2">
                      <span>🏃</span>
                      <span>ラジオ体操メンバー</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    onClick={() => {
                      setDisplayName(savedProfile.displayName)
                      setProfileText(savedProfile.profileText)
                      setIsEditing(true)
                    }}
                    className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition"
                  >
                    <span className="text-lg">✏️</span>
                  </button>
                </div>
              </div>
            </div>

            <RainbowFrame background="white" className="rounded-t-none mb-6">
              {/* レベル表示 */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">⭐</span>
                  </div>
                  <div>
                    <div className="text-gray-600 text-sm">Your Level ›</div>
                    <div className="text-xl font-bold text-gray-800">健康マスター</div>
                  </div>
                </div>

                {/* 円形プログレス */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-60 h-60 relative">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* 背景円 */}
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="6"
                        />
                        {/* プログレス円 */}
                        <circle 
                          cx="60" 
                          cy="60" 
                          r="50" 
                          fill="none" 
                          stroke="url(#progressGradient)" 
                          strokeWidth="6"
                          strokeDasharray={`${(32 / 50) * 314} 314`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                        <defs>
                          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10b981" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* 中央の数字 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-gray-800 mb-1">32</div>
                        <div className="text-gray-600 text-sm font-medium text-center">
                          参加回数 今年 ›
                        </div>
                      </div>
                    </div>

                    {/* マイルストーン表示 */}
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-bold">✓</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">25</div>
                      </div>
                    </div>
                    
                    <div className="absolute top-1/2 -right-2 transform translate-x-1/2 -translate-y-1/2">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-gray-600 text-sm">○</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">50</div>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 right-6">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-gray-600 text-sm">○</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-1 font-medium">75</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 次のレベルまで */}
                <div className="text-center mb-6">
                  <div className="text-gray-600 text-sm mb-2">次のレベルまで</div>
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{width: '64%'}}></div>
                  </div>
                  <div className="text-xs text-gray-500">18回参加でプラチナマスター達成！</div>
                </div>
              </div>
            </RainbowFrame>

            {/* プロフィール編集モーダル */}
            {isEditing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">プロフィール編集</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        表示名
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={session.user?.name || 'ユーザー'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        自己紹介 (200文字まで)
                      </label>
                      <textarea
                        value={profileText}
                        onChange={(e) => setProfileText(e.target.value.slice(0, 200))}
                        placeholder="ラジオ体操への想いや趣味などを入力してください..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {profileText.length}/200文字
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400"
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* プロフィール表示 */}
            {savedProfile.profileText && (
              <RainbowFrame background="white" className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">✨ 自己紹介</h3>
                <p className="text-gray-600 leading-relaxed">{savedProfile.profileText}</p>
              </RainbowFrame>
            )}

            {/* 一緒に参加したユーザー */}
            <RainbowFrame background="white" className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👥 一緒に参加したユーザー</h3>
              <div className="space-y-3">
                {[
                  { name: '田中太郎', events: 15, lastSeen: '今日', image: null },
                  { name: '鈴木花子', events: 12, lastSeen: '昨日', image: null },
                  { name: '山田次郎', events: 8, lastSeen: '3日前', image: null },
                  { name: '佐藤美咲', events: 6, lastSeen: '1週間前', image: null }
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        L
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{user.name}</div>
                        <div className="text-sm text-gray-600">
                          {user.events}回一緒に参加 • 最後: {user.lastSeen}
                        </div>
                      </div>
                    </div>
                    <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition">
                      プロフィール
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="text-center mt-4">
                <button className="text-blue-500 text-sm hover:text-blue-600 transition">
                  全て表示 ({47}人)
                </button>
              </div>
            </RainbowFrame>

            {/* クイックアクション */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <Link
                href="/events"
                className="p-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center"
              >
                📅 イベントを見る
              </Link>
              <Link
                href="/ranking"
                className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-center"
              >
                🏆 ランキングを見る
              </Link>
            </div>

            {/* 最近の参加履歴 */}
            <RainbowFrame background="white" className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">📋 最近の参加履歴</h3>
              <div className="space-y-3">
                {[
                  { date: '2025-09-13', event: '散歩', status: '参加済み' },
                  { date: '2025-09-12', event: '夏休みラジオ体操 2024', status: '参加済み' },
                  { date: '2025-09-11', event: '散歩', status: '参加済み' },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-semibold text-gray-800">{item.event}</div>
                      <div className="text-sm text-gray-600">{item.date}</div>
                    </div>
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </RainbowFrame>

            {/* ログアウト */}
            <RainbowFrame background="white">
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-800 mb-4">アカウント管理</h3>
                <AuthButtons />
              </div>
            </RainbowFrame>
          </div>
        </div>
      </main>
    )
  }

  // 未ログイン - ログインページ表示
  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🔑 ログイン
            </h1>
            <p className="text-xl text-gray-600">
              朝から始まる物語に参加しよう
            </p>
          </div>

          <RainbowFrame background="white" className="mb-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🏃</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                ようこそ！
              </h2>
              <p className="text-gray-600 mb-6">
                LINEアカウントでログインして、<br />
                朝から始まる健康習慣を始めましょう！
              </p>
              
              <div className="space-y-4">
                <AuthButtons />
              </div>
            </div>
          </RainbowFrame>

          <RainbowFrame background="white">
            <div>
              <h3 className="font-bold text-lg mb-3">📱 朝活アプリの特徴</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>QRコードで簡単チェックイン</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>毎日の参加記録を自動管理</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>みんなとランキングで競争</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>✅</span>
                  <span>継続参加で素敵な景品GET</span>
                </li>
              </ul>
            </div>
          </RainbowFrame>
        </div>
      </div>
    </main>
  )
}