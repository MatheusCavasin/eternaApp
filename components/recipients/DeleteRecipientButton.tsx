'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteRecipient } from '@/app/(dashboard)/recipients/actions'

export default function DeleteRecipientButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este destinatário?')) return
    startTransition(async () => {
      await deleteRecipient(id)
      router.refresh()
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-rose-600 transition-colors hover:text-rose-500 disabled:opacity-50"
    >
      {isPending ? 'Excluindo...' : 'Excluir'}
    </button>
  )
}
