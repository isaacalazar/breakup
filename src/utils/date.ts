export function isValidISODate(str: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false
  const date = new Date(str + 'T00:00:00Z')
  return date.toISOString().startsWith(str)
}

export function toUTCStartOfDay(str: string): Date {
  return new Date(str + 'T00:00:00Z')
}

export function combineLocalDateTimeToUTC(dateISO: string, timeHHmm?: string): string {
  const time = timeHHmm || '09:00'
  return new Date(`${dateISO}T${time}:00`).toISOString()
}

export function daysBetweenUTC(a: Date, b: Date): number {
  const diffMs = b.getTime() - a.getTime()
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
}