import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import DeleteButton from '@/components/messages/DeleteButton'

export default async function MessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: messages }] = await Promise.all([
    supabase.from('users').select('plan_id').eq('id', user!.id).single(),
    supabase
      .from('messages')
      .select('id, title, created_at, updated_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limit = PLAN_LIMITS[plan].messages
  const count = messages?.length ?? 0
  const atLimit = limit !== null && count >= limit

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mensagens</h1>
          <p className="mt-1 text-sm text-slate-500">
            {limit !== null
              ? `${count} de ${limit} mensagem${limit > 1 ? 's' : ''}`
              : `${count} mensagem${count !== 1 ? 's' : ''}`}
          </p>
        </div>
        {atLimit ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
            Limite atingido —{' '}
            <Link href="/billing" className="font-medium underline">
              fazer upgrade
            </Link>
          </div>
        ) : (
          <Link
            href="/messages/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            + Nova mensagem
          </Link>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <p className="text-sm font-medium text-slate-500">Nenhuma mensagem ainda</p>
          <p className="mt-1 text-xs text-slate-400">
            Crie sua primeira mensagem para seus entes queridos.
          </p>
          <Link
            href="/messages/new"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            + Nova mensagem
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left">Título</th>
                <th className="px-5 py-3 text-left">Criada em</th>
                <th className="px-5 py-3 text-left">Atualizada em</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {messages?.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{msg.title}</td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {new Date(msg.updated_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/messages/${msg.id}/edit`}
                        className="text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        Editar
                      </Link>
                      <DeleteButton id={msg.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
