# Eterna — Especificação do Projeto

## Visão geral

O **Eterna** é um serviço web de assinatura mensal que permite que qualquer pessoa escreva mensagens personalizadas para seus entes queridos. Essas mensagens são entregues automaticamente por e-mail após a confirmação do falecimento do assinante, detectada via APIs de consulta de situação do CPF (SintegraWS ou Infosimples).

**Nome provisório:** Eterna  
**Mercado:** Brasil  
**Modelo:** SaaS com assinatura mensal  
**Plataforma:** Web (desktop e mobile browser)

---

## Stack tecnológica

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Node.js + Express (API REST) |
| Banco de dados | PostgreSQL via Supabase |
| Autenticação | Supabase Auth |
| Pagamentos | Stripe |
| E-mail | Resend |
| Job Scheduler | node-cron (verificação semanal de CPFs) |
| API de óbito | SintegraWS (primária) / Infosimples (fallback) |
| Deploy | Vercel (frontend) + Railway (backend) |

---

## Fases do projeto

### Fase 1 — MVP (foco atual)
- Cadastro e autenticação de usuários
- Editor de mensagem rich text (TipTap)
- Cadastro de destinatários (limitado por plano)
- Cadastro de contato de confiança
- Integração com API de óbito (SintegraWS)
- Job scheduler semanal de verificação de CPF
- Fluxo de confirmação de óbito (e-mail para contato de confiança + janela de 7 dias)
- Disparo automático de mensagens após confirmação
- Integração com Stripe (planos de assinatura mensal)
- Painel do usuário (dashboard)

### Fase 2
- Editor com suporte a upload de PDF e imagens
- Múltiplas mensagens por destinatário
- Agendamento de entrega (ex: aniversários pós-morte)
- Relatório de status de entrega

### Fase 3
- Suporte a áudio e vídeo
- App mobile (React Native)
- Integrações adicionais de verificação de óbito
- Planos empresariais / white-label

---

## Modelos de dados principais

### users
- id, email, name, cpf, created_at, plan_id, status

### messages
- id, user_id, title, content (rich text HTML), created_at, updated_at

### recipients
- id, user_id, name, email, relationship, created_at

### trusted_contacts
- id, user_id, name, email, phone, created_at

### death_checks
- id, user_id, checked_at, api_response, status (alive | deceased | error)

### delivery_events
- id, user_id, triggered_at, confirmation_sent_at, confirmed_at, messages_sent_at, status

### subscriptions
- id, user_id, stripe_subscription_id, plan, status, current_period_end

---

## Planos de assinatura

| Plano | Mensagens | Destinatários | Preço |
|---|---|---|---|
| Básico | 1 | até 3 | R$ 19,90/mês |
| Essencial | 3 | até 10 | R$ 39,90/mês |
| Completo | ilimitado | ilimitado | R$ 69,90/mês |

---

## Fluxo de verificação de óbito

1. Job roda toda segunda-feira às 08h (node-cron)
2. Para cada assinante ativo, consulta CPF na API SintegraWS
3. Se retornar `titular_falecido = true`:
   - Registra evento em `death_checks`
   - Envia e-mail de confirmação para o `trusted_contact`
   - Aguarda 7 dias pela resposta
4. Se o contato confirmar (clica em link) OU não responder em 7 dias:
   - Sistema dispara todas as mensagens do usuário para os respectivos destinatários via Resend
   - Registra evento em `delivery_events`
5. Se o contato negar (ainda vivo):
   - Evento é cancelado, registro salvo com status `denied`
   - Próxima verificação ocorre normalmente

---

## Regras e padrões de desenvolvimento

- **Idioma do código:** inglês (variáveis, funções, comentários, commits)
- **Idioma da interface:** português (Brasil)
- **Estilo de código:** ESLint + Prettier
- **Gerenciamento de estado:** Zustand
- **Formulários:** React Hook Form + Zod
- **Editor rich text:** TipTap
- **Autenticação:** sempre via Supabase Auth, nunca implementar manualmente
- **Pagamentos:** sempre via Stripe, nunca armazenar dados de cartão
- **Variáveis sensíveis:** sempre via `.env.local`, nunca hardcoded
- **Proteção de rotas:** middleware Next.js verificando sessão Supabase
- **LGPD:** CPF deve ser armazenado criptografado (AES-256)

---

## Estrutura de pastas (Next.js)

```
eterna/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── messages/
│   │   ├── recipients/
│   │   ├── settings/
│   │   └── billing/
│   └── api/
│       ├── webhooks/stripe/
│       └── webhooks/death-confirmation/
├── components/
│   ├── ui/
│   ├── editor/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── stripe/
│   ├── resend/
│   └── death-check/
├── jobs/
│   └── weekly-check.ts
└── types/
```

---

## Milestone 1 — To-do list para o Claude Code

### Setup inicial
- [ ] Criar projeto Next.js 14 com App Router e TypeScript
- [ ] Configurar Tailwind CSS
- [ ] Configurar ESLint e Prettier
- [ ] Criar projeto no Supabase e configurar variáveis de ambiente
- [ ] Criar schema SQL no Supabase (tabelas: users, messages, recipients, trusted_contacts, subscriptions)

### Autenticação
- [ ] Implementar página de cadastro com email/senha via Supabase Auth
- [ ] Implementar página de login
- [ ] Implementar middleware de proteção de rotas
- [ ] Implementar logout

### Dashboard
- [ ] Criar layout base do dashboard (sidebar + header)
- [ ] Criar página inicial do dashboard com resumo (mensagens, destinatários, status do plano)

### Mensagens
- [ ] Integrar editor TipTap na página de criação de mensagem
- [ ] Implementar CRUD de mensagens (criar, listar, editar, excluir)
- [ ] Validar limite de mensagens por plano

### Destinatários
- [ ] Implementar CRUD de destinatários
- [ ] Validar limite de destinatários por plano
- [ ] Implementar cadastro de contato de confiança

### Integração API de óbito
- [ ] Criar cliente HTTP para SintegraWS
- [ ] Implementar função `checkCpfStatus(cpf: string)`
- [ ] Criar job semanal com node-cron
- [ ] Implementar lógica de confirmação (e-mail via Resend + link de confirmação/negação)
- [ ] Implementar disparo de mensagens após confirmação

### Pagamentos
- [ ] Criar produtos e planos no Stripe Dashboard
- [ ] Implementar checkout de assinatura via Stripe
- [ ] Implementar webhook do Stripe para atualizar status da assinatura
- [ ] Implementar página de billing (plano atual, histórico, cancelar)

---

## Como usar este spec com o Claude Code

Ao iniciar cada sessão no Claude Code, execute:

```
Leia o arquivo spec.md na raiz do projeto e retome de onde paramos no Milestone 1.
```

O Claude Code vai ler o contexto completo e continuar o desenvolvimento de forma consistente.
