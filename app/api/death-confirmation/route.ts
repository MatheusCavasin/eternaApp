import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { triggerMessageDelivery } from '@/lib/death-check/processor'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')
  const action = searchParams.get('action')

  if (!token || (action !== 'confirm' && action !== 'deny')) {
    return NextResponse.redirect(new URL('/?confirmation=invalid', request.url))
  }

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('delivery_events')
    .select('id, user_id, status')
    .eq('confirmation_token', token)
    .maybeSingle()

  if (!event) {
    return NextResponse.redirect(new URL('/?confirmation=not_found', request.url))
  }

  if (event.status !== 'pending') {
    return NextResponse.redirect(new URL('/?confirmation=already_processed', request.url))
  }

  if (action === 'deny') {
    await supabase
      .from('delivery_events')
      .update({ status: 'denied', confirmed_at: new Date().toISOString() })
      .eq('id', event.id)

    return NextResponse.redirect(new URL('/?confirmation=denied', request.url))
  }

  // action === 'confirm'
  await triggerMessageDelivery(event.user_id, event.id)

  return NextResponse.redirect(new URL('/?confirmation=confirmed', request.url))
}
