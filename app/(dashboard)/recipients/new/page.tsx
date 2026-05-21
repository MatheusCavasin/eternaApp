import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/types'
import type { Plan } from '@/types'
import RecipientForm from '@/components/recipients/RecipientForm'

export default async function NewRecipientPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from('users').select('plan_id').eq('id', user!.id).single(),
    supabase.from('recipients').select('*', { count: 'exact', head: true }).eq('user_id', user!.id),
  ])

  const plan = (profile?.plan_id ?? 'basic') as Plan
  const limit = PLAN_LIMITS[plan].recipients

  if (limit !== null && (count ?? 0) >= limit) {
    redirect('/recipients')
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link
          href="/recipients"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          ← Voltar
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Novo destinatário</h1>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <RecipientForm />
      </div>
    </div>
  )
}
