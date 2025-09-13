'use client'

import { signIn, useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'

export default function DemoLoginButton() {
  const { data: session } = useSession()
  const [demoUser, setDemoUser] = useState<'member' | 'admin'>('member')
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

  const handleDemoLogin = () => {
    const mockSession = {
      user: {
        id: demoUser === 'admin' ? 'demo-admin-1' : 'demo-user-1',
        name: demoUser === 'admin' ? '管理者デモ' : 'デモユーザー',
        email: demoUser === 'admin' ? 'admin@demo.com' : 'demo@example.com',
        role: demoUser
      }
    }
    
    localStorage.setItem('demoSession', JSON.stringify(mockSession))
    window.location.reload()
  }

  const handleDemoLogout = () => {
    localStorage.removeItem('demoSession')
    window.location.reload()
  }

  // デモセッションが存在し、通常のセッションがない場合
  if (demoSession && !session) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          {demoSession.user.name} (デモモード)
        </span>
        <button
          onClick={handleDemoLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          ログアウト
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setDemoUser('member')}
          className={`px-4 py-2 rounded border ${
            demoUser === 'member' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          一般ユーザー
        </button>
        <button
          onClick={() => setDemoUser('admin')}
          className={`px-4 py-2 rounded border ${
            demoUser === 'admin'
              ? 'bg-purple-500 text-white'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          管理者
        </button>
      </div>
      
      <button
        onClick={handleDemoLogin}
        className="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
      >
        🎯 デモログイン ({demoUser === 'admin' ? '管理者' : '一般ユーザー'})
      </button>

      <div className="text-center">
        <button
          onClick={() => signIn('line')}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition flex items-center gap-2 mx-auto"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
          </svg>
          LINEでログイン
        </button>
        <p className="text-xs text-gray-500 mt-2">
          実際のLINEアカウントでログインできます
        </p>
      </div>
    </div>
  )
}