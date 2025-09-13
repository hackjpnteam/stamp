import EventCreator from '@/components/EventCreator'
import EventList from '@/components/EventList'
import RainbowFrame from '@/components/RainbowFrame'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              📅 朝活イベント
            </h1>
            <p className="text-xl text-gray-600">
              朝から始まる健康活動の作成・参加管理
            </p>
          </div>

          {/* イベント一覧 */}
          <EventList />

          {/* イベント作成（ログイン時のみ） */}
          {session && (
            <div className="mt-8">
              <EventCreator />
            </div>
          )}

          {/* 未ログイン時のメッセージ */}
          {!session && (
            <RainbowFrame background="white" className="mt-8">
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  イベントを作成するにはログインが必要です
                </p>
                <a
                  href="/auth"
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition inline-block"
                >
                  ログインする
                </a>
              </div>
            </RainbowFrame>
          )}
        </div>
      </div>
    </main>
  )
}