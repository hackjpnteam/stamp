import { format, toZonedTime } from 'date-fns-tz'

const JST_TIMEZONE = 'Asia/Tokyo'

export function jstDateString(date: Date = new Date()): string {
  const jstDate = toZonedTime(date, JST_TIMEZONE)
  return format(jstDate, 'yyyy-MM-dd', { timeZone: JST_TIMEZONE })
}

export function inDailyWindow(
  now: Date = new Date(),
  start: string = '06:00',
  end: string = '09:00',
  graceMinutes: number = 0
): boolean {
  const jstNow = toZonedTime(now, JST_TIMEZONE)
  const [startHour, startMinute] = start.split(':').map(Number)
  const [endHour, endMinute] = end.split(':').map(Number)
  
  const nowMinutes = jstNow.getHours() * 60 + jstNow.getMinutes()
  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute + graceMinutes
  
  return nowMinutes >= startMinutes && nowMinutes <= endMinutes
}

export function getJSTNow(): Date {
  return toZonedTime(new Date(), JST_TIMEZONE)
}