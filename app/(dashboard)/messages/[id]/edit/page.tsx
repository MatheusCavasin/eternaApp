import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MessageForm from '@/components/messages/MessageForm'

export default async function EditMessagePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: message } = await supabase
    .from('messages')
    .select('id, title, content')
    .eq('id', params.id)
    .eq('user_id', user!.id)
    .single()

  if (!message) notFound()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link href="/messages" className="text-sm text-slate-500 transition-colors hover:text-slate-900">
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Editar mensagem</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <MessageForm
          messageId={message.id}
          defaultValues={{ title: message.title, content: message.content }}
        />
      </div>
    </div>
  )
}
