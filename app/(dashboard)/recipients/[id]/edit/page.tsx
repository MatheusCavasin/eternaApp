import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import RecipientForm from '@/components/recipients/RecipientForm'

export default async function EditRecipientPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: recipient } = await supabase
    .from('recipients')
    .select('id, name, email, relationship')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!recipient) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/recipients"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Editar destinatário</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <RecipientForm
          recipientId={recipient.id}
          defaultValues={{
            name: recipient.name,
            email: recipient.email,
            relationship: recipient.relationship ?? '',
          }}
        />
      </div>
    </div>
  )
}
