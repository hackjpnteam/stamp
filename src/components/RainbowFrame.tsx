'use client'

interface RainbowFrameProps {
  children: React.ReactNode
  className?: string
  background?: 'black' | 'white'
}

export default function RainbowFrame({ children, className = '', background = 'black' }: RainbowFrameProps) {
  // スクリーンショット画像の正確な色を再現
  const gradientStyle = {
    background: `conic-gradient(
      from 0deg,
      #8b5cf6 0deg,
      #a855f7 45deg,
      #3b82f6 90deg,
      #06b6d4 135deg,
      #10b981 180deg,
      #84cc16 225deg,
      #eab308 270deg,
      #f97316 315deg,
      #ef4444 360deg
    )`
  }
  
  return (
    <div 
      className={`p-[4px] rounded-[16px] ${className}`}
      style={gradientStyle}
    >
      <div className={`rounded-[12px] p-6 md:p-10 ${background === 'white' ? 'bg-white' : 'bg-black'}`}>
        {children}
      </div>
    </div>
  )
}

// デモページ用コンポーネント
export function RainbowFrameDemo() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-6xl mx-auto space-y-8 py-8">
        
        {/* スクリーンショット完全再現版 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🌈 完璧な虹色フレーム</h1>
          <p className="text-gray-600">スクリーンショットの色を完璧に再現</p>
        </div>

        <RainbowFrame background="white" className="mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              ✨ Perfect Rainbow Border
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              スクリーンショット画像の虹色グラデーションを<br/>
              完璧に再現したボーダーデザイン
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-violet-500 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Violet</p>
                <p className="text-gray-500">#8b5cf6</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Blue</p>
                <p className="text-gray-500">#3b82f6</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Green</p>
                <p className="text-gray-500">#10b981</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold">Yellow</p>
                <p className="text-gray-500">#eab308</p>
              </div>
            </div>
          </div>
        </RainbowFrame>

        {/* 従来の黒背景版 */}
        <RainbowFrame>
          <div className="text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              🖤 黒背景バージョン
            </h3>
            <p className="text-gray-300 text-lg mb-6">
              黒背景に虹色グラデーションの美しいフレームデザイン
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="text-red-400 mb-2">🔴 Red</div>
                <p>情熱と力強さを表現</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="text-green-400 mb-2">🟢 Green</div>
                <p>自然と成長を象徴</p>
              </div>
              <div className="p-4 bg-gray-900 rounded-lg">
                <div className="text-blue-400 mb-2">🔵 Blue</div>
                <p>信頼と安定感</p>
              </div>
            </div>
          </div>
        </RainbowFrame>

        {/* 小さなフレーム */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <RainbowFrame>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                ✨ カード1
              </h3>
              <p className="text-gray-300 text-sm">
                コンパクトなレイアウトでも美しく表示されます
              </p>
            </div>
          </RainbowFrame>

          <RainbowFrame>
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                🚀 カード2
              </h3>
              <p className="text-gray-300 text-sm">
                レスポンシブデザインに完全対応
              </p>
            </div>
          </RainbowFrame>
        </div>

        {/* アニメーション付きフレーム */}
        <RainbowFrame className="animate-pulse">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              💫 アニメーション効果
            </h2>
            <p className="text-gray-300">
              animate-pulseクラスでほのかに光る効果を演出
            </p>
          </div>
        </RainbowFrame>

        {/* グラデーション詳細 */}
        <RainbowFrame>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              🎨 カラーパレット
            </h2>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
              <div className="w-8 h-8 bg-orange-500 rounded-full"></div>
              <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
              <div className="w-8 h-8 bg-indigo-500 rounded-full"></div>
              <div className="w-8 h-8 bg-violet-500 rounded-full"></div>
            </div>
            <p className="text-gray-300 text-sm">
              Red → Orange → Yellow → Green → Blue → Indigo → Violet
            </p>
          </div>
        </RainbowFrame>
      </div>
    </div>
  )
}