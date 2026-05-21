import { NextResponse } from 'next/server'
import { runWeeklyDeathCheck, processExpiredEvents } from '@/lib/death-check/processor'

// Vercel Cron: toda segunda-feira às 11:00 UTC (08:00 BRT)
// vercel.json → "schedule": "0 11 * * 1"
// Protect with CRON_SECRET to prevent unauthorized calls
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await processExpiredEvents()
  const result = await runWeeklyDeathCheck()

  return NextResponse.json({ ok: true, ...result })
}
