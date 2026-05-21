'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import RichTextEditor from '@/components/editor/RichTextEditor'
import { createMessage, updateMessage } from '@/app/(dashboard)/messages/actions'

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório').max(100, 'Máximo 100 caracteres'),
  content: z.string().min(1, 'Conteúdo obrigatório'),
})

type FormData = z.infer<typeof schema>

interface MessageFormProps {
  messageId?: string
  defaultValues?: Partial<FormData>
}

export default function MessageForm({ messageId, defaultValues }: MessageFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title ?? '',
      content: defaultValues?.content ?? '',
    },
  })

  function onSubmit(data: FormData) {
    setServerError(null)
    startTransition(async () => {
      const result = messageId
        ? await updateMessage(messageId, data)
        : await createMessage(data)

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
        <label htmlFor="title" className="block text-sm font-medium text-slate-700">
          Título
        </label>
        <input
          id="title"
          type="text"
          placeholder="Ex: Para minha filha querida"
          {...register('title')}
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Mensagem</label>
        <div className="mt-1.5">
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                placeholder="Escreva sua mensagem aqui..."
              />
            )}
          />
        </div>
        {errors.content && (
          <p className="mt-1 text-xs text-rose-600">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => router.push('/messages')}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : messageId ? 'Salvar alterações' : 'Criar mensagem'}
        </button>
      </div>
    </form>
  )
}
