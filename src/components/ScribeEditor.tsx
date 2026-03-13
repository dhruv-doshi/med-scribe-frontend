'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useSummarize, useGenerateNotes } from '@/hooks/useScribe'
import { ROUTES } from '@/constants/routes'
import type { NoteType } from '@/types/scribe'

const NOTE_TYPES: { value: NoteType; label: string }[] = [
  { value: 'general', label: 'General Notes' },
  { value: 'meeting', label: 'Meeting Minutes' },
  { value: 'research', label: 'Research Notes' },
  { value: 'clinical', label: 'Clinical SOAP' },
]

export default function ScribeEditor() {
  const router = useRouter()
  const [mode, setMode] = useState<'summarize' | 'generate'>('summarize')
  const [text, setText] = useState('')
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
      router.push(ROUTES.SCRIBE_RESULT(session.id))
    } catch {
      setError('Processing failed. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle — pill with sliding indicator */}
      <div className="flex rounded-full border border-[var(--border)] bg-[var(--secondary)] p-1">
        {(['summarize', 'generate'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200 ${
              mode === m
                ? 'bg-[var(--accent-cyan)] text-white shadow-[0_0_8px_var(--accent-cyan-glow)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            {m === 'summarize' ? 'Summarize Text' : 'Generate Notes'}
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
    </div>
  )
}
