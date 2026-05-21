'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/(dashboard)/billing/actions'
import type { Plan } from '@/types'

interface CheckoutButtonProps {
  plan: Plan
  label: string
  variant?: 'primary' | 'outline'
}

export default function CheckoutButton({
  plan,
  label,
  variant = 'primary',
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    const result = await createCheckoutSession(plan)
    if (result?.url) {
      window.location.href = result.url
    } else {
      alert(result?.error ?? 'Ocorreu um erro ao iniciar o checkout. Tente novamente.')
      setIsLoading(false)
    }
  }

  const base = 'w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50'
  const styles =
    variant === 'primary'
      ? `${base} bg-slate-900 text-white hover:bg-slate-700`
      : `${base} border border-slate-300 text-slate-700 hover:bg-slate-50`

  return (
    <button onClick={handleClick} disabled={isLoading} className={styles}>
      {isLoading ? 'Aguarde...' : label}
    </button>
  )
}
