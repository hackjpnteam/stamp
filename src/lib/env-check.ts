// Environment Variables Validation
export function validateEnvironmentVariables() {
  const requiredVars = {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    LINE_CLIENT_ID: process.env.LINE_CLIENT_ID,
    LINE_CLIENT_SECRET: process.env.LINE_CLIENT_SECRET,
    MONGODB_URI: process.env.MONGODB_URI,
  }

  const missing: string[] = []
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      missing.push(key)
    }
  })

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing)
    return false
  }

  console.log('✅ All required environment variables are set')
  
  // Validate NEXTAUTH_URL format
  if (requiredVars.NEXTAUTH_URL && !requiredVars.NEXTAUTH_URL.startsWith('http')) {
    console.error('❌ NEXTAUTH_URL must start with http:// or https://')
    return false
  }

  // Validate NEXTAUTH_SECRET length (警告のみ)
  if (requiredVars.NEXTAUTH_SECRET && requiredVars.NEXTAUTH_SECRET.length < 32) {
    console.warn('⚠️ NEXTAUTH_SECRET should be at least 32 characters long for better security')
    // 本番環境では警告のみ、ビルドは継続
  }

  return true
}

// Check environment on startup
if (process.env.NODE_ENV === 'production') {
  validateEnvironmentVariables()
}