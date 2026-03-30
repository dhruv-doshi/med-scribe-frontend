'use client'

import { useEffect, useState } from 'react'
import { Mic, MicOff, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranscription } from '@/hooks/useTranscription'

interface AmbientTranscriptionProps {
  onTranscriptReady: (transcript: string, title: string) => void
  isPending?: boolean
}

export default function AmbientTranscription({
  onTranscriptReady,
  isPending = false,
}: AmbientTranscriptionProps) {
  const [title, setTitle] = useState('')
  const {
    transcript,
    interimText,
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  } = useTranscription()

  console.log('[AmbientTranscription] State updated', {
    isSupported,
    isRecording,
    isPending,
    transcriptLength: transcript.length,
    transcriptPreview: transcript.length > 0 ? '[REDACTED - ' + transcript.length + ' chars]' : '[empty]',
  })

  useEffect(() => {
    return () => {
      stopRecording()
    }
  }, [stopRecording])

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
        Your browser does not support the Web Speech API. Please use Chrome or
        Edge for ambient transcription.
      </div>
    )
  }

  const wordCount = transcript.split(/\s+/).filter(Boolean).length

  return (
    <div className="space-y-4">
      {/* Mic button area */}
      <div className="flex flex-col items-center gap-3 py-6">
        <button
          onClick={() => {
            if (isRecording) {
              console.log('[AmbientTranscription] User clicked STOP')
              stopRecording()
            } else {
              console.log('[AmbientTranscription] User clicked START')
              startRecording()
            }
          }}
          disabled={isPending}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${
            isRecording
              ? 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)] shadow-[0_0_20px_rgba(229,82,69,0.3)]'
              : 'border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] hover:shadow-[0_0_20px_var(--accent-cyan-glow)]'
          }`}
        >
          {isRecording ? (
            <>
              <span
                className="absolute inset-0 rounded-full border-2 border-[var(--destructive)] opacity-75"
                style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
              />
              <MicOff className="h-8 w-8" />
            </>
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </button>
        <p className="text-sm text-[var(--muted-foreground)]">
          {isRecording ? 'Recording… click to stop' : 'Click to start recording'}
        </p>
      </div>

      {/* Live transcript box — only shown when recording or transcript exists */}
      {(isRecording || transcript) && (
        <div className="grid-bg relative min-h-[180px] rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-2 font-mono text-sm">
          {transcript && (
            <span className="text-[var(--foreground)]">{transcript}</span>
          )}
          {interimText && (
            <span className="text-[var(--muted-foreground)] italic"> {interimText}</span>
          )}
          {!transcript && !interimText && isRecording && (
            <span className="text-[var(--muted-foreground)] italic">Listening…</span>
          )}
          {transcript && (
            <span className="absolute bottom-3 right-3 font-mono text-xs text-[var(--muted-foreground)]">
              {wordCount} words
            </span>
          )}
        </div>
      )}

      {/* Actions — only shown when there is a finalized transcript */}
      {transcript && !isRecording && (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Session title (optional)"
            disabled={isPending}
            className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] disabled:opacity-50"
          />
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('[AmbientTranscription] User clicked CLEAR')
                clearTranscript()
                setTitle('')
              }}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <Trash2 className="h-3 w-3" />
              Clear
            </button>

            <Button
              onClick={() => {
                console.log('[AmbientTranscription] User clicked GENERATE NOTES', {
                  transcriptLength: transcript.length,
                  hasTitle: title.trim().length > 0,
                })
                onTranscriptReady(transcript, title)
              }}
              disabled={isPending || !transcript.trim()}
              size="pill"
              className="ml-auto shadow-[0_0_12px_var(--accent-cyan-glow)]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                'Generate Clinical Notes'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
