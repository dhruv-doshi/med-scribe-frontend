'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, Menu, X } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import ThemeToggle from '@/components/ThemeToggle'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Glassmorphism sticky nav */}
      <header className="glass-nav sticky top-0 z-40 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          {/* Brand */}
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[var(--accent-cyan)]" />
            <span className="font-serif text-lg font-semibold">MedScribe</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-3 sm:flex">
            <ThemeToggle />
            <Link
              href={ROUTES.LOGIN}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="rounded-full bg-[var(--accent-cyan)] px-4 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity shadow-[0_0_12px_var(--accent-cyan-glow)]"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="mx-auto mt-3 max-w-5xl space-y-2 pb-3 sm:hidden">
            <Link
              href={ROUTES.LOGIN}
              className="block rounded-lg px-4 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--secondary)] hover:text-[var(--foreground)]"
              onClick={() => setMobileOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.REGISTER}
              className="block rounded-lg bg-[var(--accent-cyan)] px-4 py-2 text-center text-sm font-medium text-white"
              onClick={() => setMobileOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[var(--border)] px-6 py-5 text-center text-sm text-[var(--muted-foreground)]">
        © 2026 MedScribe · AI Medical Documentation
      </footer>
    </div>
  )
}
