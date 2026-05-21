'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import { z } from 'zod'

const messageSchema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100, 'Título muito longo'),
  content: z.string().min(1, 'Conteúdo obrigatório'),
})

export async function createMessage(data: { title: string; content: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = messageSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan_id')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limit = PLAN_LIMITS[plan].messages

  if (limit !== null) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      return {
        error: `Seu plano permite no máximo ${limit} mensagem${limit > 1 ? 's' : ''}. Faça upgrade para adicionar mais.`,
      }
    }
  }

  const { error } = await supabase.from('messages').insert({
    user_id: user.id,
    title: parsed.data.title,
    content: parsed.data.content,
  })

  if (error) {
    return { error: 'Erro ao salvar a mensagem. Tente novamente.' }
  }

  revalidatePath('/messages')
  redirect('/messages')
}

export async function updateMessage(id: string, data: { title: string; content: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = messageSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('messages')
    .update({ title: parsed.data.title, content: parsed.data.content })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar a mensagem. Tente novamente.' }
  }

  revalidatePath('/messages')
  redirect('/messages')
}

export async function deleteMessage(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('messages').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/messages')
}
