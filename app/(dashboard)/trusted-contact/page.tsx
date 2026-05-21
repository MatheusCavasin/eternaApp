import { createClient } from '@/lib/supabase/server'
import TrustedContactForm from '@/components/trusted-contact/TrustedContactForm'

export default async function TrustedContactPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: contact } = await supabase
    .from('trusted_contacts')
    .select('name, email, phone')
    .eq('user_id', user!.id)
    .maybeSingle()

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Contato de Confiança</h1>
        <p className="mt-1 text-sm text-slate-500">
          Esta pessoa será notificada para confirmar seu falecimento antes do envio das mensagens.
        </p>
      </div>

      {!contact && (
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Você ainda não cadastrou um contato de confiança. Sem ele, o sistema não poderá disparar
          suas mensagens.
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <TrustedContactForm
          exists={!!contact}
          defaultValues={{
            name: contact?.name ?? '',
            email: contact?.email ?? '',
            phone: contact?.phone ?? '',
          }}
        />
      </div>
    </div>
  )
}
