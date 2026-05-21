import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'

const PLAN_LABELS: Record<Plan, string> = {
  basic: 'Básico',
  essential: 'Essencial',
  complete: 'Completo',
}

const PLAN_PRICES: Record<Plan, string> = {
  basic: 'R$ 19,90/mês',
  essential: 'R$ 39,90/mês',
  complete: 'R$ 69,90/mês',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [
    { data: profile },
    { count: messagesCount },
    { count: recipientsCount },
    { data: trustedContact },
  ] = await Promise.all([
    supabase.from('users').select('name, plan_id').eq('id', user!.id).single(),
    supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase
      .from('recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id),
    supabase.from('trusted_contacts').select('name').eq('user_id', user!.id).maybeSingle(),
  ])

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limits = PLAN_LIMITS[plan]
  const msgs = messagesCount ?? 0
  const rcps = recipientsCount ?? 0

  const firstName = profile?.name?.split(' ')[0] ?? 'usuário'

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta, {firstName}</h1>
        <p className="mt-1 text-sm text-slate-500">Aqui está um resumo da sua conta.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {/* Mensagens */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Mensagens
            </p>
            <div className="rounded-lg bg-indigo-50 p-1.5 text-indigo-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{msgs}</p>
          <p className="mt-0.5 text-sm text-slate-400">
            {limits.messages !== null ? `de ${limits.messages} disponível` : 'sem limite'}
          </p>
          {limits.messages !== null && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.min((msgs / limits.messages) * 100, 100)}%` }}
              />
            </div>
          )}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link href="/messages" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Gerenciar mensagens →
            </Link>
          </div>
        </div>

        {/* Destinatários */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Destinatários
            </p>
            <div className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{rcps}</p>
          <p className="mt-0.5 text-sm text-slate-400">
            {limits.recipients !== null ? `de ${limits.recipients} disponível` : 'sem limite'}
          </p>
          {limits.recipients !== null && (
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min((rcps / limits.recipients) * 100, 100)}%` }}
              />
            </div>
          )}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link href="/recipients" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
              Gerenciar destinatários →
            </Link>
          </div>
        </div>

        {/* Plano */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Plano atual
            </p>
            <div className="rounded-lg bg-amber-50 p-1.5 text-amber-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <line x1="2" x2="22" y1="10" y2="10" />
              </svg>
            </div>
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{PLAN_LABELS[plan]}</p>
          <p className="mt-0.5 text-sm text-slate-400">{PLAN_PRICES[plan]}</p>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link href="/billing" className="text-xs font-medium text-amber-600 hover:text-amber-500">
              Gerenciar plano →
            </Link>
          </div>
        </div>

        {/* Contato de Confiança */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Contato de Confiança
            </p>
            <div className="rounded-lg bg-rose-50 p-1.5 text-rose-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
          </div>
          {trustedContact ? (
            <>
              <p className="mt-3 text-xl font-bold text-slate-900 truncate">{trustedContact.name}</p>
              <p className="mt-0.5 text-sm text-emerald-500">Cadastrado</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-3xl font-bold text-slate-300">—</p>
              <p className="mt-0.5 text-sm text-amber-500">Não cadastrado</p>
            </>
          )}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Link href="/trusted-contact" className="text-xs font-medium text-rose-600 hover:text-rose-500">
              {trustedContact ? 'Editar contato →' : 'Cadastrar agora →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
