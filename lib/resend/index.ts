import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM = 'Eterna <noreply@eterna.app>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendDeathConfirmationEmail({
  to,
  trustedContactName,
  userName,
  token,
}: {
  to: string
  trustedContactName: string
  userName: string
  token: string
}) {
  const confirmUrl = `${APP_URL}/api/death-confirmation?token=${token}&action=confirm`
  const denyUrl = `${APP_URL}/api/death-confirmation?token=${token}&action=deny`

  return resend.emails.send({
    from: FROM,
    to,
    subject: `Confirmação de falecimento — ${userName}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#1e293b">
        <h1 style="font-size:22px;font-weight:700;margin-bottom:8px">Eterna</h1>
        <p>Olá, ${trustedContactName}.</p>
        <p>
          Nosso sistema identificou uma possível alteração na situação cadastral de
          <strong>${userName}</strong> na Receita Federal. Pedimos que você confirme
          ou negue essa informação para que possamos agir corretamente.
        </p>
        <p style="margin:28px 0">
          <a href="${confirmUrl}"
             style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;
                    border-radius:8px;text-decoration:none;font-weight:600;margin-right:12px">
            Confirmar falecimento
          </a>
          <a href="${denyUrl}"
             style="display:inline-block;border:1px solid #cbd5e1;color:#475569;
                    padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">
            Negar — está vivo(a)
          </a>
        </p>
        <p style="font-size:13px;color:#64748b">
          Se você não responder em 7 dias, as mensagens serão enviadas automaticamente.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="font-size:12px;color:#94a3b8">
          Este e-mail foi enviado pelo serviço Eterna porque você foi cadastrado(a)
          como contato de confiança de ${userName}.
        </p>
      </div>
    `,
  })
}

export async function sendMessageEmail({
  to,
  recipientName,
  senderName,
  subject,
  htmlContent,
}: {
  to: string
  recipientName: string
  senderName: string
  subject: string
  htmlContent: string
}) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: subject || `Uma mensagem de ${senderName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
        <p style="font-size:13px;color:#64748b;margin-bottom:24px">
          Olá, ${recipientName}. Uma mensagem especial foi deixada para você por <strong>${senderName}</strong>.
        </p>
        <div style="border-left:3px solid #0f172a;padding-left:20px">
          ${htmlContent}
        </div>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0"/>
        <p style="font-size:12px;color:#94a3b8">
          Entregue com carinho pelo serviço Eterna.
        </p>
      </div>
    `,
  })
}
