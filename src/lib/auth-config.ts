// NextAuth URL Configuration for Vercel
export function getAuthUrl(): string {
  // 1. 明示的に設定されたNEXTAUTH_URLを優先
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  
  // 2. Vercel環境の場合、自動的にURLを構築
  if (process.env.VERCEL_URL) {
    // Vercel URLはドメインのみなので、HTTPSプロトコルを追加
    const vercelUrl = process.env.VERCEL_URL.startsWith('http') 
      ? process.env.VERCEL_URL 
      : `https://${process.env.VERCEL_URL}`
    return vercelUrl
  }
  
  // 3. Vercel環境だが、URLが取得できない場合の警告
  if (process.env.VERCEL) {
    console.warn('Running on Vercel but VERCEL_URL is not set. Using fallback.')
  }
  
  // 4. ローカル開発環境のデフォルト
  return 'http://localhost:3001'
}

// LINE OAuth Callback URL
export function getCallbackUrl(): string {
  const baseUrl = getAuthUrl()
  return `${baseUrl}/api/auth/callback/line`
}

// Debug information
export function getAuthDebugInfo() {
  return {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    VERCEL: process.env.VERCEL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    computedAuthUrl: getAuthUrl(),
    computedCallbackUrl: getCallbackUrl(),
  }
}