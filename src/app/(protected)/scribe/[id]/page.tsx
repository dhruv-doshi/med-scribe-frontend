'use client'

import { useParams } from 'next/navigation'
import { useScribeSession } from '@/hooks/useScribe'
import SummarizationResultView from '@/components/SummarizationResult'
import NoteCard from '@/components/NoteCard'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import type { SummarizationResult, NoteGenerationResult } from '@/types/scribe'

export default function ScribeResultPage() {
  const { id } = useParams<{ id: string }>()
  const { data: session, isLoading, isError } = useScribeSession(id)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-cyan)] border-t-transparent" />
        <p className="text-sm text-[var(--muted-foreground)]">Loading session…</p>
      </div>
    )
  }

  if (isError || !session) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-[var(--destructive)]" />
        <p className="text-[var(--muted-foreground)]">Session not found.</p>
        <Link href={ROUTES.DASHBOARD}>
          <Button variant="primary-outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl capitalize">
            {session.type === 'summarize' ? 'Summarization' : 'Generated Notes'}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {new Date(session.created_at).toLocaleString()}
          </p>
        </div>
        <Link href={ROUTES.SCRIBE}>
          <Button size="pill" className="shadow-[0_0_12px_var(--accent-cyan-glow)]">
            New Session
          </Button>
        </Link>
      </div>

      {session.status !== 'completed' ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)]">
          {session.status === 'processing' ? 'Processing…' : 'Processing failed.'}
        </div>
      ) : session.type === 'summarize' ? (
        <SummarizationResultView result={session.result as SummarizationResult} />
      ) : (
        <NoteCard result={session.result as NoteGenerationResult} />
      )}
    </div>
  )
}
