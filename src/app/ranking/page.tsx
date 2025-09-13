import ParticipantRanking from '@/components/ParticipantRanking'
import RecentUsers from '@/components/RecentUsers'
import RainbowFrame from '@/components/RainbowFrame'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function RankingPage() {
  const session = await getServerSession(authOptions)

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🏆 ランキング＆アクティビティ
            </h1>
            <p className="text-xl text-gray-600">
              参加者ランキングと最新の活動状況
            </p>
          </div>

          {/* ランキングと直近登録ユーザー */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <ParticipantRanking />
            <RecentUsers />
          </div>

          {/* 統計情報 */}
          <div className="grid md:grid-cols-3 gap-6">
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-lg mb-2">総参加者数</h3>
                <div className="text-3xl font-bold text-blue-600 mb-2">127名</div>
                <p className="text-gray-600 text-sm">アクティブユーザー</p>
              </div>
            </RainbowFrame>
            
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-4xl mb-3">🎯</div>
                <h3 className="font-bold text-lg mb-2">今月の目標達成者</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">45名</div>
                <p className="text-gray-600 text-sm">20日以上参加</p>
              </div>
            </RainbowFrame>
            
            <RainbowFrame background="white">
              <div className="text-center">
                <div className="text-4xl mb-3">🔥</div>
                <h3 className="font-bold text-lg mb-2">連続参加記録</h3>
                <div className="text-3xl font-bold text-orange-600 mb-2">28日</div>
                <p className="text-gray-600 text-sm">
                  {session?.user?.name || 'あなた'}の記録
                </p>
              </div>
            </RainbowFrame>
          </div>

          {/* 今週の表彰 */}
          <RainbowFrame background="white" className="mt-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                🎉 今週のMVP
              </h3>
              
              <div className="flex justify-center items-center gap-6 mb-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">🥇</div>
                  <div className="font-bold text-lg text-gray-800">田中太郎</div>
                  <div className="text-sm text-gray-600">7日連続参加</div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  🌟 毎日欠かさず参加し、他の参加者にも声かけをしてくれました！
                </p>
              </div>
            </div>
          </RainbowFrame>
        </div>
      </div>
    </main>
  )
}