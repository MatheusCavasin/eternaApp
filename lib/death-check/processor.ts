import { randomBytes } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkCpfStatus } from './sintegra'
import { sendDeathConfirmationEmail, sendMessageEmail } from '@/lib/resend'

export async function runWeeklyDeathCheck(): Promise<{ checked: number; flagged: number; errors: number }> {
  const supabase = createAdminClient()

  // Users ativos com CPF cadastrado
  const { data: users, error } = await supabase
    .from('users')
    .select('id, name, email, cpf')
    .eq('status', 'active')
    .not('cpf', 'is', null)

  if (error || !users) return { checked: 0, flagged: 0, errors: 1 }

  let flagged = 0
  let errors = 0

  for (const user of users) {
    const cpf = user.cpf as string
    const { result, rawResponse } = await checkCpfStatus(cpf)

    await supabase.from('death_checks').insert({
      user_id: user.id,
      api_response: rawResponse,
      status: result,
    })

    if (result === 'error') {
      errors++
      continue
    }

    if (result === 'deceased') {
      // Verifica se já existe evento pendente para este usuário
      const { data: existing } = await supabase
        .from('delivery_events')
        .select('id')
        .eq('user_id', user.id)
        .in('status', ['pending', 'confirmed'])
        .maybeSingle()

      if (existing) continue

      // Busca contato de confiança
      const { data: trustedContact } = await supabase
        .from('trusted_contacts')
        .select('name, email')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!trustedContact) continue

      const token = randomBytes(32).toString('hex')

      const { error: insertError } = await supabase.from('delivery_events').insert({
        user_id: user.id,
        confirmation_token: token,
        confirmation_sent_at: new Date().toISOString(),
        status: 'pending',
      })

      if (insertError) {
        errors++
        continue
      }

      await sendDeathConfirmationEmail({
        to: trustedContact.email,
        trustedContactName: trustedContact.name,
        userName: user.name,
        token,
      })

      flagged++
    }
  }

  return { checked: users.length, flagged, errors }
}

export async function processExpiredEvents(): Promise<void> {
  const supabase = createAdminClient()

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Eventos pendentes com mais de 7 dias sem resposta → auto-confirma
  const { data: expired } = await supabase
    .from('delivery_events')
    .select('id, user_id, confirmation_token')
    .eq('status', 'pending')
    .lt('confirmation_sent_at', sevenDaysAgo)

  for (const event of expired ?? []) {
    await triggerMessageDelivery(event.user_id, event.id)
  }
}

export async function triggerMessageDelivery(userId: string, eventId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('delivery_events')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', eventId)

  const [{ data: messages }, { data: recipients }, { data: user }] = await Promise.all([
    supabase.from('messages').select('title, content').eq('user_id', userId),
    supabase.from('recipients').select('name, email').eq('user_id', userId),
    supabase.from('users').select('name').eq('id', userId).single(),
  ])

  if (!messages?.length || !recipients?.length || !user) return

  for (const recipient of recipients) {
    for (const message of messages) {
      await sendMessageEmail({
        to: recipient.email,
        recipientName: recipient.name,
        senderName: user.name,
        subject: message.title,
        htmlContent: message.content,
      })
    }
  }

  await supabase
    .from('delivery_events')
    .update({ status: 'sent', messages_sent_at: new Date().toISOString() })
    .eq('id', eventId)
}
