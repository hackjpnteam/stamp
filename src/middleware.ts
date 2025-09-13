import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes - ページレベルで制御するためmiddlewareでは制限しない
    if (path.startsWith('/admin')) {
      // 管理者ページは認証済みであれば通す（権限チェックはページレベルで実行）
      return NextResponse.next()
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname
        
        // Public routes
        if (path === '/' || path.startsWith('/api/auth')) {
          return true
        }
        
        // Admin routes - always allow (権限チェックはページレベルで)
        if (path.startsWith('/admin')) {
          return true
        }
        
        // Other protected routes require authentication
        return !!token
      }
    }
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/events/:path*',
    '/api/((?!auth).)*'
  ]
}