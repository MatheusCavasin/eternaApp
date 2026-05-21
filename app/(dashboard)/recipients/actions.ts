'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import { z } from 'zod'

const recipientSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  relationship: z.string().max(50, 'Relacionamento muito longo').optional(),
})

export async function createRecipient(data: {
  name: string
  email: string
  relationship?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = recipientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('plan_id')
    .eq('id', user.id)
    .single()

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limit = PLAN_LIMITS[plan].recipients

  if (limit !== null) {
    const { count } = await supabase
      .from('recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if ((count ?? 0) >= limit) {
      return {
        error: `Seu plano permite no máximo ${limit} destinatário${limit > 1 ? 's' : ''}. Faça upgrade para adicionar mais.`,
      }
    }
  }

  const { error } = await supabase.from('recipients').insert({
    user_id: user.id,
    name: parsed.data.name,
    email: parsed.data.email,
    relationship: parsed.data.relationship || null,
  })

  if (error) {
    return { error: 'Erro ao salvar o destinatário. Tente novamente.' }
  }

  revalidatePath('/recipients')
  redirect('/recipients')
}

export async function updateRecipient(
  id: string,
  data: { name: string; email: string; relationship?: string }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = recipientSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase
    .from('recipients')
    .update({
      name: parsed.data.name,
      email: parsed.data.email,
      relationship: parsed.data.relationship || null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: 'Erro ao atualizar o destinatário. Tente novamente.' }
  }

  revalidatePath('/recipients')
  redirect('/recipients')
}

export async function deleteRecipient(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('recipients').delete().eq('id', id).eq('user_id', user.id)

  revalidatePath('/recipients')
}
