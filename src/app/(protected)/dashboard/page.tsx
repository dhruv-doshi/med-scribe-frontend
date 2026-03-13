import HistoryList from '@/components/HistoryList'
import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export const metadata = { title: 'Dashboard — MedScribe' }

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl">Documentation Sessions</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">All your AI-generated notes in one place.</p>
        </div>
        <Link href={ROUTES.SCRIBE}>
          <Button size="pill" className="shadow-[0_0_12px_var(--accent-cyan-glow)]">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </Link>
      </div>
      <HistoryList />
    </div>
  )
}
