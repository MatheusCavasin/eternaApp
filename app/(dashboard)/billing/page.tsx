import { createClient } from '@/lib/supabase/server'
import { PLAN_DETAILS } from '@/lib/stripe/plans'
import CheckoutButton from '@/components/billing/CheckoutButton'
import ManageSubscriptionButton from '@/components/billing/ManageSubscriptionButton'
import type { Plan, SubscriptionStatus } from '@/types'

const PLAN_ORDER: Plan[] = ['basic', 'essential', 'complete']

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('users').select('plan_id').eq('id', user!.id).single(),
    supabase
      .from('subscriptions')
      .select('plan, status, current_period_end')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])

  const currentPlan = (profile?.plan_id ?? 'basic') as Plan
  const subStatus = subscription?.status as SubscriptionStatus | null
  const hasActiveSubscription = subStatus === 'active' || subStatus === 'trialing'

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Plano & Cobrança</h1>
        <p className="mt-1 text-sm text-slate-500">
          Plano atual: <span className="font-medium text-slate-700">{PLAN_DETAILS[currentPlan].label}</span>
          {subscription?.current_period_end && (
            <span className="ml-2 text-slate-400">
              · renova em{' '}
              {new Date(subscription.current_period_end).toLocaleDateString('pt-BR')}
            </span>
          )}
        </p>
      </div>

      {searchParams.success && (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Assinatura realizada com sucesso! Seu plano será atualizado em instantes.
        </div>
      )}

      {subStatus === 'past_due' && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          Pagamento pendente. Atualize seu método de pagamento para continuar usando o serviço.
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {PLAN_ORDER.map((plan) => {
          const details = PLAN_DETAILS[plan]
          const isCurrent = plan === currentPlan

          return (
            <div
              key={plan}
              className={`flex flex-col rounded-xl border p-6 shadow-sm ${
                isCurrent
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isCurrent ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {details.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-bold ${isCurrent ? 'text-white' : 'text-slate-900'}`}
                >
                  {details.price}
                  <span
                    className={`ml-1 text-sm font-normal ${isCurrent ? 'text-slate-400' : 'text-slate-400'}`}
                  >
                    /mês
                  </span>
                </p>
                <ul
                  className={`mt-4 space-y-2 text-sm ${isCurrent ? 'text-slate-300' : 'text-slate-600'}`}
                >
                  <li>{details.messages}</li>
                  <li>{details.recipients}</li>
                </ul>
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  <div
                    className="w-full rounded-lg border border-slate-700 px-4 py-2 text-center text-sm font-medium text-slate-400"
                  >
                    Plano atual
                  </div>
                ) : hasActiveSubscription ? (
                  <ManageSubscriptionButton />
                ) : (
                  <CheckoutButton plan={plan} label="Assinar" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {hasActiveSubscription && (
        <div className="mt-8 flex justify-end">
          <ManageSubscriptionButton />
        </div>
      )}
    </div>
  )
}
