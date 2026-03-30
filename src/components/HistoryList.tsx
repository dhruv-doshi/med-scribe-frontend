'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useScribeHistory } from '@/hooks/useScribe'
import { ROUTES } from '@/constants/routes'
import { Activity, Loader2 } from 'lucide-react'

export default function HistoryList() {
  const { data: sessions, isLoading } = useScribeHistory()
  const [titles, setTitles] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!sessions?.length) return
    const map: Record<string, string> = {}
    for (const s of sessions) {
      const saved = localStorage.getItem(`medscribe_title_${s.id}`)
      map[s.id] = saved ?? (s.type === 'summarize' ? 'Summarization' : 'Note Generation')
    }
    setTitles(map)
  }, [sessions])

  if (isLoading) return (
    <div className="flex justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--accent-cyan)]" />
    </div>
  )

  if (!sessions?.length) return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
      <Activity className="mx-auto mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
      <p className="text-[var(--muted-foreground)]">No sessions yet.</p>
      <Link href={ROUTES.SCRIBE} className="mt-4 inline-block text-[var(--accent-cyan)] hover:underline">
        Start scribing →
      </Link>
    </div>
  )

  return (
    <div className="space-y-3">
      {sessions.map(s => (
        <Link key={s.id} href={ROUTES.SCRIBE_RESULT(s.id)}>
          <div className="scan-card card-glow flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-[var(--accent-cyan)]" />
              <div>
                <p className="font-medium">
                  {titles[s.id] || (s.type === 'summarize' ? 'Summarization' : 'Note Generation')}
                </p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {new Date(s.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              s.status === 'completed'
                ? 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'
                : s.status === 'failed'
                  ? 'bg-[var(--destructive)]/15 text-[var(--destructive)]'
                  : 'bg-amber-500/15 text-amber-500'
            }`}>
              {s.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
