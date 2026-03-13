'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Activity, LayoutDashboard, FilePen, LogOut } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_ITEMS = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.SCRIBE, label: 'New Scribe', icon: FilePen },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-[var(--border)] bg-[var(--card)] lg:flex">
        {/* Brand */}
        <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--border)]">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-cyan)]/15 ring-1 ring-[var(--accent-cyan)]/40">
            <Activity className="h-4 w-4 text-[var(--accent-cyan)]" />
          </div>
          <span className="font-serif text-lg font-semibold">MedScribe</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                    : 'text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: theme + sign out */}
        <div className="border-t border-[var(--border)] px-3 py-4 space-y-1">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-[var(--muted-foreground)]">Theme</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-3 lg:hidden">
        <Link href={ROUTES.DASHBOARD} className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-[var(--accent-cyan)]" />
          <span className="font-serif font-semibold">MedScribe</span>
        </Link>
        <ThemeToggle />
      </div>

      {/* Main content */}
      <main className="flex-1 lg:pl-60">
        <div className="pt-14 lg:pt-0">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-[var(--border)] bg-[var(--card)] lg:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== ROUTES.DASHBOARD && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                active ? 'text-[var(--accent-cyan)]' : 'text-[var(--muted-foreground)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          )
        })}
        <button
          onClick={() => signOut({ callbackUrl: ROUTES.LOGIN })}
          className="flex flex-1 flex-col items-center gap-1 py-3 text-xs font-medium text-[var(--muted-foreground)]"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </nav>
    </div>
  )
}
