'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useScribeSession, useSaveDoctorAnswers, useUpdateSession, useDeleteSession } from '@/hooks/useScribe'
import SummarizationResultView from '@/components/SummarizationResult'
import NoteCard from '@/components/NoteCard'
import DoctorSuggestions from '@/components/DoctorSuggestions'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { AlertCircle, Edit2, Trash2, Check, X } from 'lucide-react'
import Link from 'next/link'
import { sanitize } from '@/lib/log-sanitizer'
import type { SummarizationResult, NoteGenerationResult, DoctorSuggestionAnswer } from '@/types/scribe'

export default function ScribeResultPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, isLoading, isError } = useScribeSession(id)
  const { mutateAsync: saveDoctorAnswers, isPending: isSavingAnswers } = useSaveDoctorAnswers(id)
  const { mutateAsync: updateSession, isPending: isUpdating } = useUpdateSession(id)
  const { mutateAsync: deleteSession, isPending: isDeleting } = useDeleteSession()

  const [savedTitle, setSavedTitle] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedResult, setEditedResult] = useState<NoteGenerationResult | null>(null)

  useEffect(() => {
    console.log('[ResultPage] Page loaded', { sessionId: id })
  }, [id])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setSavedTitle(localStorage.getItem(`medscribe_title_${id}`) ?? null)
    }
  }, [id])

  useEffect(() => {
    if (isLoading) {
      console.log('[ResultPage] Fetching session...', { sessionId: id })
    } else if (isError) {
      console.error('[ResultPage] ✗ Error loading session', { sessionId: id })
    } else if (session) {
      console.log('[ResultPage] ✓ Session fetched', sanitize({
        sessionId: session.id,
        type: session.type,
        status: session.status,
        hasResult: !!session.result,
        resultFields: session.result ? Object.keys(session.result).slice(0, 3) : null,
      }))
    }
  }, [session, isLoading, isError, id])

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

  const displayTitle = savedTitle || (session.type === 'summarize' ? 'Summarization' : 'Generated Notes')

  const handleSaveAnswers = async (answers: DoctorSuggestionAnswer[]) => {
    try {
      console.log('[ResultPage] Saving doctor answers...', { count: answers.length })
      await saveDoctorAnswers(answers)
      console.log('[ResultPage] ✓ Doctor answers saved')
    } catch (error) {
      console.error('[ResultPage] ✗ Failed to save answers', error)
    }
  }

  const handleEditStart = () => {
    if (!session) return
    setIsEditing(true)
    setEditedTitle(savedTitle || displayTitle)
    setEditedResult(session.result as NoteGenerationResult)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditedTitle('')
    setEditedResult(null)
  }

  const handleEditSave = async () => {
    if (!editedResult) return
    try {
      console.log('[ResultPage] Saving edits...')
      await updateSession({
        title: editedTitle,
        result: editedResult,
      })
      // Update localStorage title
      if (editedTitle) {
        localStorage.setItem(`medscribe_title_${id}`, editedTitle)
        setSavedTitle(editedTitle)
      }
      setIsEditing(false)
      setEditedTitle('')
      setEditedResult(null)
      console.log('[ResultPage] ✓ Edits saved')
    } catch (error) {
      console.error('[ResultPage] ✗ Failed to save edits', error)
      alert(`Failed to save changes: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    try {
      console.log('[ResultPage] Deleting session...', { id })
      await deleteSession(id)
      console.log('[ResultPage] ✓ Session deleted')
      router.push(ROUTES.DASHBOARD)
    } catch (error) {
      console.error('[ResultPage] ✗ Failed to delete session', error)
      alert(`Failed to delete session: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {isEditing ? (
            <input
              type="text"
              value={editedTitle}
              onChange={e => setEditedTitle(e.target.value)}
              className="w-full font-serif text-3xl border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
            />
          ) : (
            <h1 className="font-serif text-3xl capitalize">{displayTitle}</h1>
          )}
          <p className="text-sm text-[var(--muted-foreground)] mt-1">
            {new Date(session.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <button
                onClick={handleEditSave}
                disabled={isUpdating}
                className="p-2 rounded hover:bg-[var(--secondary)] disabled:opacity-50 transition-colors"
                aria-label="Save"
                title="Save"
              >
                <Check className="h-5 w-5 text-green-500" />
              </button>
              <button
                onClick={handleEditCancel}
                disabled={isUpdating}
                className="p-2 rounded hover:bg-[var(--secondary)] disabled:opacity-50 transition-colors"
                aria-label="Cancel"
                title="Cancel"
              >
                <X className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditStart}
                disabled={isUpdating}
                className="p-2 rounded hover:bg-[var(--secondary)] disabled:opacity-50 transition-colors"
                aria-label="Edit"
                title="Edit"
              >
                <Edit2 className="h-5 w-5 text-[var(--muted-foreground)]" />
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 rounded hover:bg-[var(--secondary)]/50 disabled:opacity-50 transition-colors"
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="h-5 w-5 text-[var(--destructive)]" />
              </button>
            </>
          )}

          <Link href={ROUTES.SCRIBE}>
            <Button size="pill" className="shadow-[0_0_12px_var(--accent-cyan-glow)]">
              New Session
            </Button>
          </Link>
        </div>
      </div>

      {session.status !== 'completed' ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-[var(--muted-foreground)]">
          {session.status === 'processing' ? 'Processing…' : 'Processing failed.'}
        </div>
      ) : session.type === 'summarize' ? (
        <SummarizationResultView result={session.result as SummarizationResult} />
      ) : (
        <>
          <NoteCard
            result={session.result as NoteGenerationResult}
            isEditing={isEditing}
            editValue={editedResult || undefined}
            onEditChange={setEditedResult}
          />

          {/* Doctor Suggestions — not shown in edit mode */}
          {!isEditing && (session.result as NoteGenerationResult)?.suggestions?.length > 0 && (
            <DoctorSuggestions
              suggestions={(session.result as NoteGenerationResult).suggestions!}
              savedAnswers={session.doctor_answers}
              onSave={handleSaveAnswers}
              isSaving={isSavingAnswers}
            />
          )}
        </>
      )}
    </div>
  )
}
