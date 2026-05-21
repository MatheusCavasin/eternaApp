'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertTrustedContact, deleteTrustedContact } from '@/app/(dashboard)/trusted-contact/actions'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(100, 'Máximo 100 caracteres'),
  email: z.string().min(1, 'E-mail obrigatório').email('E-mail inválido'),
  phone: z.string().max(20, 'Máximo 20 caracteres').optional(),
})

type FormData = z.infer<typeof schema>

interface TrustedContactFormProps {
  defaultValues?: Partial<FormData>
  exists: boolean
}

export default function TrustedContactForm({ defaultValues, exists }: TrustedContactFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()
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
      phone: defaultValues?.phone ?? '',
    },
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    startTransition(async () => {
      const result = await upsertTrustedContact(data)
      if (result?.error) {
        setServerError(result.error)
      }
    })
  }

  function handleDelete() {
    if (!confirm('Tem certeza que deseja remover o contato de confiança?')) return
    startDeleteTransition(async () => {
      await deleteTrustedContact()
      router.refresh()
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
        <label htmlFor="tc-name" className="block text-sm font-medium text-slate-700">
          Nome
        </label>
        <input
          id="tc-name"
          type="text"
          placeholder="Ex: João Silva"
          {...register('name')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="tc-email" className="block text-sm font-medium text-slate-700">
          E-mail
        </label>
        <input
          id="tc-email"
          type="email"
          placeholder="Ex: joao@email.com"
          {...register('email')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="tc-phone" className="block text-sm font-medium text-slate-700">
          Telefone <span className="text-slate-400">(opcional)</span>
        </label>
        <input
          id="tc-phone"
          type="tel"
          placeholder="Ex: (11) 99999-9999"
          {...register('phone')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {exists ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm text-rose-600 transition-colors hover:text-rose-500 disabled:opacity-50"
          >
            {isDeleting ? 'Removendo...' : 'Remover contato'}
          </button>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : exists ? 'Salvar alterações' : 'Cadastrar contato'}
        </button>
      </div>
    </form>
  )
}
