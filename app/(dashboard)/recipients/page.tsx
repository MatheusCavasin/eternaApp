import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import DeleteRecipientButton from '@/components/recipients/DeleteRecipientButton'

export default async function RecipientsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: recipients }] = await Promise.all([
    supabase.from('users').select('plan_id').eq('id', user!.id).single(),
    supabase
      .from('recipients')
      .select('id, name, email, relationship, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false }),
  ])

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limit = PLAN_LIMITS[plan].recipients
  const count = recipients?.length ?? 0
  const atLimit = limit !== null && count >= limit

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Destinatários</h1>
          <p className="mt-1 text-sm text-slate-500">
            {limit !== null
              ? `${count} de ${limit} destinatário${limit > 1 ? 's' : ''}`
              : `${count} destinatário${count !== 1 ? 's' : ''}`}
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
            href="/recipients/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            + Novo destinatário
          </Link>
        )}
      </div>

      {count === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <p className="text-sm font-medium text-slate-500">Nenhum destinatário ainda</p>
          <p className="mt-1 text-xs text-slate-400">
            Adicione as pessoas que receberão suas mensagens.
          </p>
          <Link
            href="/recipients/new"
            className="mt-5 inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            + Novo destinatário
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left">Nome</th>
                <th className="px-5 py-3 text-left">E-mail</th>
                <th className="px-5 py-3 text-left">Relacionamento</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recipients?.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-900">{r.name}</td>
                  <td className="px-5 py-3 text-slate-500">{r.email}</td>
                  <td className="px-5 py-3 text-slate-500">{r.relationship ?? '—'}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/recipients/${r.id}/edit`}
                        className="text-indigo-600 transition-colors hover:text-indigo-500"
                      >
                        Editar
                      </Link>
                      <DeleteRecipientButton id={r.id} />
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
