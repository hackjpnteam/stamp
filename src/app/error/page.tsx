'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'

// Dynamic rendering required due to useSearchParams
export const dynamic = 'force-dynamic'

function ErrorPageContent() {
  const searchParams = useSearchParams()
  const [debugInfo, setDebugInfo] = useState<any>(null)
  
  const error = searchParams.get('error')
  
  useEffect(() => {
    // 本番環境でのデバッグ情報を取得
    fetch('/api/auth/debug')
      .then(res => res.json())
      .then(data => setDebugInfo(data))
      .catch(err => console.error('Debug fetch error:', err))
  }, [])

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: '設定エラー',
          message: 'NextAuth設定に問題があります。環境変数を確認してください。',
          details: [
            'NEXTAUTH_URL が正しく設定されているか確認',
            'NEXTAUTH_SECRET が設定されているか確認',
            'LINE OAuth の設定を確認'
          ]
        }
      case 'OAuthSignin':
        return {
          title: 'LINE OAuth エラー',
          message: 'LINE認証でエラーが発生しました。',
          details: [
            'LINE Developer Console のCallback URLを確認',
            'LINE_CLIENT_ID と LINE_CLIENT_SECRET を確認',
            'LINEチャンネルが有効になっているか確認'
          ]
        }
      case 'OAuthCallback':
        return {
          title: 'コールバックエラー',
          message: 'LINE認証のコールバック処理でエラーが発生しました。',
          details: [
            'Callback URLがNextAuth設定と一致しているか確認',
            'NEXTAUTH_URL環境変数を確認',
            '本番環境のURLが正しいか確認'
          ]
        }
      case 'OAuthCreateAccount':
        return {
          title: 'アカウント作成エラー',
          message: 'アカウントの作成に失敗しました。',
          details: [
            'MongoDB接続を確認',
            'データベースの権限を確認'
          ]
        }
      case 'EmailCreateAccount':
        return {
          title: 'メール認証エラー',
          message: 'メールアカウントの作成に失敗しました。',
          details: []
        }
      case 'Callback':
        return {
          title: 'コールバックエラー',
          message: '認証コールバックでエラーが発生しました。',
          details: [
            'NextAuth callbacks設定を確認',
            'MongoDB接続を確認'
          ]
        }
      case 'OAuthAccountNotLinked':
        return {
          title: 'アカウント未連携',
          message: 'このLINEアカウントは既存のアカウントと連携されていません。',
          details: []
        }
      case 'EmailSignin':
        return {
          title: 'メールサインインエラー',
          message: 'メールでのサインインに失敗しました。',
          details: []
        }
      case 'CredentialsSignin':
        return {
          title: '認証情報エラー',
          message: '認証情報が正しくありません。',
          details: []
        }
      case 'SessionRequired':
        return {
          title: 'セッション必須',
          message: 'このページにアクセスするにはログインが必要です。',
          details: []
        }
      default:
        return {
          title: '認証エラー',
          message: 'ログイン処理中にエラーが発生しました。',
          details: [
            '環境変数の設定を確認',
            'LINE OAuth設定を確認',
            'ネットワーク接続を確認'
          ]
        }
    }
  }

  const errorInfo = getErrorMessage(error)

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {errorInfo.title}
              </h1>
              <p className="text-gray-600">
                {errorInfo.message}
              </p>
            </div>

            {error && (
              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">
                  エラーコード: <span className="font-mono font-bold">{error}</span>
                </p>
              </div>
            )}

            {errorInfo.details.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-800 mb-3">
                  確認事項：
                </h2>
                <ul className="space-y-2">
                  {errorInfo.details.map((detail, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">✓</span>
                      <span className="text-gray-600">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* デバッグ情報（開発環境のみ表示） */}
            {debugInfo && process.env.NODE_ENV === 'development' && (
              <details className="mb-6">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  デバッグ情報（開発用）
                </summary>
                <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            )}

            <div className="flex justify-center gap-4">
              <Link
                href="/"
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                ホームに戻る
              </Link>
              <Link
                href="/auth"
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                再度ログイン
              </Link>
            </div>
          </div>

          {/* サポート情報 */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>問題が解決しない場合は、管理者にお問い合わせください。</p>
            <p className="mt-2">
              <a 
                href="https://github.com/hackjpnteam/stamp/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600"
              >
                問題を報告 →
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">読み込み中...</h1>
              </div>
            </div>
          </div>
        </div>
      </main>
    }>
      <ErrorPageContent />
    </Suspense>
  )
}