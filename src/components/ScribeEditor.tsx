'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSummarize, useGenerateNotes } from '@/hooks/useScribe'
import { ROUTES } from '@/constants/routes'
import type { NoteType } from '@/types/scribe'
import AmbientTranscription from '@/components/AmbientTranscription'
import { sanitize } from '@/lib/log-sanitizer'

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'general', label: 'General Notes' },
  { value: 'meeting', label: 'Meeting Minutes' },
  { value: 'research', label: 'Research Notes' },
  { value: 'clinical', label: 'Clinical SOAP' },
]

const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  general: 'General Notes',
  meeting: 'Meeting Minutes',
  research: 'Research Notes',
  clinical: 'Clinical SOAP Note',
}

function buildTitle(userTitle: string, fallback: string): string {
  return userTitle.trim() || fallback
}

function dateSuffix(): string {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function ScribeEditor() {
  const router = useRouter()
  const [mode, setMode] = useState<'summarize' | 'generate' | 'ambient'>('summarize')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [noteType, setNoteType] = useState<NoteType>('general')
  const [error, setError] = useState<string | null>(null)

  const { mutateAsync: summarize, isPending: isSummarizing } = useSummarize()
  const { mutateAsync: generate, isPending: isGenerating } = useGenerateNotes()
  const isPending = isSummarizing || isGenerating

  const wordCount = text.split(/\s+/).filter(Boolean).length

  const handleSubmit = async () => {
    if (!text.trim()) return
    setError(null)
    try {
      const session = mode === 'summarize'
        ? await summarize({ text })
        : await generate({ text, note_type: noteType })
      const fallback = mode === 'summarize'
        ? `Summarization — ${dateSuffix()}`
        : `${NOTE_TYPE_LABELS[noteType]} — ${dateSuffix()}`
      localStorage.setItem(`medscribe_title_${session.id}`, buildTitle(title, fallback))
      const editParam = mode === 'generate' ? '?edit=true' : ''
      router.push(ROUTES.SCRIBE_RESULT(session.id) + editParam)
    } catch {
      setError('Processing failed. Please try again.')
    }
  }

  const handleAmbientSubmit = async (transcript: string, sessionTitle: string) => {
    console.log('[ScribeEditor] handleAmbientSubmit called', {
      transcriptLength: transcript.length,
      hasTitle: sessionTitle.trim().length > 0,
    })
    setError(null)
    try {
      console.log('[ScribeEditor] Sending to backend:', sanitize({
        endpoint: '/scribe/generate',
        payload: {
          text: '[REDACTED - ' + transcript.length + ' chars]',
          note_type: 'clinical',
        },
      }))
      const session = await generate({ text: transcript, note_type: 'clinical' })
      localStorage.setItem(
        `medscribe_title_${session.id}`,
        buildTitle(sessionTitle, `Clinical SOAP Note — ${dateSuffix()}`)
      )
      console.log('[ScribeEditor] ✓ Session created successfully', sanitize({
        sessionId: session.id,
        type: session.type,
        status: session.status,
      }))
      console.log('[ScribeEditor] Redirecting to result page:', ROUTES.SCRIBE_RESULT(session.id))
      router.push(ROUTES.SCRIBE_RESULT(session.id) + '?edit=true')
    } catch (err) {
      console.error('[ScribeEditor] ✗ Generation failed', sanitize({
        error: err instanceof Error ? err.message : String(err),
        fullError: err,
      }))
      setError('Processing failed. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle — pill with sliding indicator */}
      <div className="flex rounded-full border border-[var(--border)] bg-[var(--secondary)] p-1">
        {(['summarize', 'generate', 'ambient'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? 'bg-[var(--accent-cyan)] text-white shadow-[0_0_8px_var(--accent-cyan-glow)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {m === 'summarize' ? 'Summarize Text' : m === 'generate' ? 'Generate Notes' : 'Ambient Transcription'}
          </button>
        ))}
      </div>

      {mode === 'generate' && (
        <div className="flex flex-wrap gap-2">
          {NOTE_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setNoteType(value)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                noteType === value
                  ? 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--foreground)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {mode !== 'ambient' ? (
        <>
          <div className="relative">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={mode === 'summarize'
                ? 'Paste clinical notes, research papers, or any medical text here…'
                : 'Paste raw text to convert into structured notes…'
              }
              className="grid-bg min-h-[300px] font-mono text-sm"
            />
            {text && (
              <span className="absolute bottom-3 right-3 font-mono text-xs text-[var(--muted-foreground)]">
                {wordCount} words
              </span>
            )}
          </div>

          {text.trim() && (
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Session title (optional)"
              className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
            />
          )}

          {error && (
            <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
              {error}
            </div>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isPending || !text.trim()}
            size="pill"
            className="w-full shadow-[0_0_12px_var(--accent-cyan-glow)]"
          >
            {isPending
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing…</>
              : mode === 'summarize' ? 'Summarize' : 'Generate Notes'
            }
          </Button>
        </>
      ) : (
        <>
          {error && (
            <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
              {error}
            </div>
          )}
          <AmbientTranscription
            onTranscriptReady={handleAmbientSubmit}
            isPending={isGenerating}
          />
        </>
      )}
    </div>
  )
}
