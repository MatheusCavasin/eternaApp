'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { deleteMessage } from '@/app/(dashboard)/messages/actions'

export default function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir esta mensagem?')) return
    startTransition(async () => {
      await deleteMessage(id)
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
