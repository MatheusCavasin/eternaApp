'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createRecipient, updateRecipient } from '@/app/(dashboard)/recipients/actions'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Máximo 100 caracteres'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  relationship: z.string().max(50, 'Máximo 50 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

interface RecipientFormProps {
  recipientId?: string
  defaultValues?: Partial<FormData>
}

export default function RecipientForm({ recipientId, defaultValues }: RecipientFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? '',
      email: defaultValues?.email ?? '',
      relationship: defaultValues?.relationship ?? '',
    },
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    startTransition(async () => {
      const result = recipientId
        ? await updateRecipient(recipientId, data)
        : await createRecipient(data)

      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {serverError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="name"
          type="text"
          placeholder="Ex: Maria Silva"
          {...register('name')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          placeholder="Ex: maria@email.com"
          {...register('email')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="relationship" className="block text-sm font-medium text-slate-700">
          Relacionamento <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="relationship"
          type="text"
          placeholder="Ex: Filha, Cônjuge, Amigo"
          {...register('relationship')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.relationship && (
          <p className="mt-1 text-xs text-rose-600">{errors.relationship.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => router.push('/recipients')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending
            ? 'Salvando...'
            : recipientId
              ? 'Salvar alterações'
              : 'Adicionar destinatário'}
        </button>
      </div>
    </form>
  )
}
