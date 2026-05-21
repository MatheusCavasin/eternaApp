'use client'

import { useState } from 'react'
import { createPortalSession } from '@/app/(dashboard)/billing/actions'

export default function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    const result = await createPortalSession()
    if (result?.url) {
      window.location.href = result.url
    } else {
      alert(result?.error ?? 'Ocorreu um erro. Tente novamente.')
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
    >
      {isLoading ? 'Aguarde...' : 'Gerenciar assinatura'}
    </button>
  )
}
