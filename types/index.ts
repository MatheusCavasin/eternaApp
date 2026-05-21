export type Plan = 'basic' | 'essential' | 'complete'
export type UserStatus = 'active' | 'inactive' | 'cancelled'
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing'
export type DeathCheckStatus = 'alive' | 'deceased' | 'error'
export type DeliveryEventStatus = 'pending' | 'confirmed' | 'denied' | 'sent'

export interface User {
  id: string
  email: string
  name: string
  cpf?: string
  plan_id: Plan
  status: UserStatus
  created_at: string
}

export interface Message {
  id: string
  user_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface Recipient {
  id: string
  user_id: string
  name: string
  email: string
  relationship?: string
  created_at: string
}

export interface TrustedContact {
  id: string
  user_id: string
  name: string
  email: string
  phone?: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id?: string
  plan: Plan
  status: SubscriptionStatus
  current_period_end?: string
  created_at: string
}

export const PLAN_LIMITS: Record<Plan, { messages: number | null; recipients: number | null }> = {
  basic: { messages: 1, recipients: 3 },
  essential: { messages: 3, recipients: 10 },
  complete: { messages: null, recipients: null },
}
