export type CpfCheckResult = 'alive' | 'deceased' | 'error'

interface SintegraWsResponse {
  status?: string
  cpf?: string
  nome?: string
  situacao?: string
  titular_falecido?: boolean
  message?: string
  [key: string]: unknown
}

interface InfosimplesResponse {
  code?: number
  code_message?: string
  data?: Array<{
    cpf?: string
    nome?: string
    situacao?: string
    titular_falecido?: boolean
  }>
}

function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, '')
}

async function checkViaSintegraWs(cpf: string): Promise<CpfCheckResult | null> {
  const token = process.env.SINTEGRA_WS_TOKEN
  if (!token || token === 'your-sintegra-ws-token') return null

  try {
    const response = await fetch(
      `https://api.sintegraweb.com.br/v1/cpf/${cleanCpf(cpf)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: AbortSignal.timeout(10_000),
      }
    )

    if (!response.ok) return null

    const data: SintegraWsResponse = await response.json()

    if (data.status === 'error' || data.status === 'ERROR') return 'error'
    if (data.titular_falecido === true) return 'deceased'
    return 'alive'
  } catch {
    return null
  }
}

async function checkViaInfosimples(cpf: string): Promise<CpfCheckResult | null> {
  const token = process.env.INFOSIMPLES_TOKEN
  if (!token || token === 'your-infosimples-token') return null

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/receita-federal/cpf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf: cleanCpf(cpf), token }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) return null

    const data: InfosimplesResponse = await response.json()

    if (data.code !== 200 || !data.data?.length) return null

    const record = data.data[0]
    if (record.titular_falecido === true) return 'deceased'
    return 'alive'
  } catch {
    return null
  }
}

export async function checkCpfStatus(cpf: string): Promise<{
  result: CpfCheckResult
  rawResponse: Record<string, unknown> | null
}> {
  const primary = await checkViaSintegraWs(cpf)
  if (primary !== null) return { result: primary, rawResponse: { provider: 'sintegraws', result: primary } }

  const fallback = await checkViaInfosimples(cpf)
  if (fallback !== null) return { result: fallback, rawResponse: { provider: 'infosimples', result: fallback } }

  return { result: 'error', rawResponse: { error: 'no_provider_available' } }
}
