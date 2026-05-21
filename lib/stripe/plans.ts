import type { Plan } from '@/types'

export const STRIPE_PRICE_IDS: Record<Plan, string> = {
  basic: process.env.STRIPE_PRICE_ID_BASIC!,
  essential: process.env.STRIPE_PRICE_ID_ESSENTIAL!,
  complete: process.env.STRIPE_PRICE_ID_COMPLETE!,
}

export function getPlanFromPriceId(priceId: string): Plan {
  const entry = Object.entries(STRIPE_PRICE_IDS).find(([, id]) => id === priceId)
  return (entry?.[0] as Plan) ?? 'basic'
}

export const PLAN_DETAILS: Record<
  Plan,
  { label: string; price: string; messages: string; recipients: string }
> = {
  basic: {
    label: 'Básico',
    price: 'R$ 19,90',
    messages: '1 mensagem',
    recipients: 'até 3 destinatários',
  },
  essential: {
    label: 'Essencial',
    price: 'R$ 39,90',
    messages: '3 mensagens',
    recipients: 'até 10 destinatários',
  },
  complete: {
    label: 'Completo',
    price: 'R$ 69,90',
    messages: 'Mensagens ilimitadas',
    recipients: 'Destinatários ilimitados',
  },
}
