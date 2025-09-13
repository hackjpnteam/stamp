import AuthButtons from '@/components/AuthButtons'
import EventCreator from '@/components/EventCreator'
import EventList from '@/components/EventList'
import ParticipantRanking from '@/components/ParticipantRanking'
import RecentUsers from '@/components/RecentUsers'
import RainbowFrame from '@/components/RainbowFrame'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-4">
              🌅 朝から始まる物語
            </h1>
            <p className="text-xl text-gray-600">
              毎朝の健康習慣を楽しく記録しよう！
            </p>
          </div>

          {!session && (
            <RainbowFrame background="white" className="mb-8">
              <div className="flex flex-col items-center space-y-6">
                <p className="text-gray-700 text-center mb-4">
                  朝活に参加しましょう
                </p>
                <AuthButtons />
              </div>
            </RainbowFrame>
          )}

          {/* イベント一覧 */}
          <EventList />

          {/* イベント作成コンポーネント */}
          <EventCreator />

          {/* ランキングと直近登録ユーザー */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <ParticipantRanking />
            <RecentUsers />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-3xl mb-3">📱</div>
                <h3 className="font-bold text-lg mb-2">かんたんチェックイン</h3>
                <p className="text-gray-600 text-sm">
                  QRコードを読み取るだけで出席を記録
                </p>
              </div>
            </RainbowFrame>
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-3xl mb-3">📅</div>
                <h3 className="font-bold text-lg mb-2">スタンプカード</h3>
                <p className="text-gray-600 text-sm">
                  毎日の参加状況を一目で確認
                </p>
              </div>
            </RainbowFrame>
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-3xl mb-3">🎁</div>
                <h3 className="font-bold text-lg mb-2">景品交換</h3>
                <p className="text-gray-600 text-sm">
                  規定数のスタンプで素敵な景品と交換
                </p>
              </div>
            </RainbowFrame>
          </div>
        </div>
      </div>
    </main>
  )
}