import crypto from 'crypto'

const QR_SECRET = process.env.QR_SECRET || 'default-secret-change-in-production'

interface QrPayload {
  eventId: string
  date: string
}

export function makeQrPayload(eventId: string, date: string): { token: string } {
  const payload = JSON.stringify({ eventId, date })
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('hex')
  
  const token = Buffer.from(JSON.stringify({
    payload,
    signature
  })).toString('base64')
  
  return { token }
}

export function verifyQrToken(token: string): QrPayload | null {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
    const { payload, signature } = decoded
    
    const expectedSignature = crypto
      .createHmac('sha256', QR_SECRET)
      .update(payload)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return null
    }
    
    return JSON.parse(payload) as QrPayload
  } catch {
    return null
  }
}