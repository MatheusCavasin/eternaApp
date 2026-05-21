'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const trustedContactSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Nome muito longo'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  phone: z.string().max(20, 'Telefone muito longo').optional(),
})

export async function upsertTrustedContact(data: {
  name: string
  email: string
  phone?: string
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = trustedContactSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { error } = await supabase.from('trusted_contacts').upsert(
    {
      user_id: user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    return { error: 'Erro ao salvar o contato. Tente novamente.' }
  }

  revalidatePath('/trusted-contact')
  revalidatePath('/dashboard')
  redirect('/trusted-contact')
}

export async function deleteTrustedContact() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await supabase.from('trusted_contacts').delete().eq('user_id', user.id)

  revalidatePath('/trusted-contact')
  revalidatePath('/dashboard')
}
