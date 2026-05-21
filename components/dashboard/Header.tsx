import { logout } from '@/app/(auth)/actions'

interface HeaderProps {
  userName: string
}

export default function Header({ userName }: HeaderProps) {
  return (
    <header className="flex h-14 flex-shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6 gap-4">
      <span className="text-sm text-slate-600">{userName}</span>
      <form action={logout}>
        <button
          type="submit"
          className="text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          Sair
        </button>
      </form>
    </header>
  )
}
