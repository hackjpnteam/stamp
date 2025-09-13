'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Link from 'next/link'

interface QrData {
  token: string
  eventTitle: string
  date: string
}

export default function EventDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [qrData, setQrData] = useState<QrData | null>(null)
  const [qrImage, setQrImage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [checkInMessage, setCheckInMessage] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      if (session.user?.role === 'admin' || session.user?.role === 'owner') {
        fetchQrCode()
      } else {
        setLoading(false)
      }
    }
  }, [session, params.id])

  const fetchQrCode = async () => {
    try {
      const res = await fetch(`/api/events/${params.id}/qr`)
      if (res.ok) {
        const data = await res.json()
        setQrData(data)
        
        // Generate QR code image
        const qrCodeDataUrl = await QRCode.toDataURL(data.token, {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrImage(qrCodeDataUrl)
      }
    } catch (error) {
      console.error('Failed to fetch QR code:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async () => {
    try {
      setCheckInMessage('チェックイン中...')
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: params.id })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (data.duplicated) {
          setCheckInMessage('✓ 本日は既にチェックイン済みです')
        } else {
          setCheckInMessage('✓ チェックインしました！')
        }
      } else {
        setCheckInMessage(`エラー: ${data.error}`)
      }
    } catch (error) {
      setCheckInMessage('チェックインに失敗しました')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'owner'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            {isAdmin && qrData ? (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {qrData.eventTitle}
                </h1>
                <p className="text-gray-600 mb-6">
                  {qrData.date} のQRコード
                </p>
                
                <div className="flex flex-col items-center">
                  {qrImage && (
                    <img 
                      src={qrImage} 
                      alt="QR Code"
                      className="mb-4"
                    />
                  )}
                  <p className="text-sm text-gray-500 text-center mb-4">
                    参加者にこのQRコードを読み取ってもらってください
                  </p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 w-full">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      受付時間
                    </p>
                    <p className="text-sm text-blue-600">
                      06:00 〜 09:00
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                  イベント参加
                </h1>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-gray-700 mb-4">
                      会場のQRコードを読み取るか、下のボタンからチェックインしてください
                    </p>
                    
                    <button
                      onClick={handleManualCheckIn}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                    >
                      手動でチェックイン
                    </button>
                    
                    {checkInMessage && (
                      <p className={`mt-4 font-semibold ${
                        checkInMessage.includes('エラー') 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {checkInMessage}
                      </p>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-800 mb-1">
                      受付時間
                    </p>
                    <p className="text-sm text-blue-600">
                      06:00 〜 09:00
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/dashboard"
              className="text-blue-500 hover:text-blue-600 transition"
            >
              ← ダッシュボードに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}