'use client'

import { useEffect, useState } from 'react'
import { Mic, MicOff, Loader2, Trash2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'
import { useTranscribeAudio } from '@/hooks/useScribe'
import { useLiveTranscription } from '@/hooks/useLiveTranscription'
import type { SpeakerSegment, TranscribeResult } from '@/types/scribe'

interface AmbientTranscriptionProps {
  onTranscriptReady: (transcript: string, title: string) => void
  isPending?: boolean
}

type RecordingState = 'idle' | 'recording' | 'processing' | 'reviewed'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AmbientTranscription({
  onTranscriptReady,
  isPending = false,
}: AmbientTranscriptionProps) {
  const [state, setState] = useState<RecordingState>('idle')
  const [title, setTitle] = useState('')
  const [segments, setSegments] = useState<SpeakerSegment[]>([])

  const {
    startRecording,
    stopRecording,
    audioBlob,
    isRecording,
    elapsedSeconds,
    isSupported,
    getChunks,
    mimeType,
  } = useAudioRecorder()

  const { mutateAsync: transcribeAudio, isPending: isTranscribing } = useTranscribeAudio()

  const { liveTranscript, isChunkTranscribing, resetLiveTranscript } = useLiveTranscription({
    isRecording,
    getChunks,
    mimeType,
  })

  console.log('[AmbientTranscription] State:', { state, isRecording, isTranscribing })

  // Handle recording state changes
  useEffect(() => {
    if (isRecording && state === 'idle') {
      setState('recording')
    }
  }, [isRecording, state])

  // Handle audio blob — trigger transcription
  useEffect(() => {
    if (audioBlob && state === 'recording') {
      ;(async () => {
        setState('processing')
        try {
          console.log('[AmbientTranscription] Transcribing audio...', { audioSize: audioBlob.size })
          const result = await transcribeAudio(audioBlob)

          // Validate response structure
          if (!result || !result.segments) {
            console.error('[AmbientTranscription] Invalid response structure', { result })
            throw new Error('Backend endpoint not implemented or returned invalid format')
          }

          console.log('[AmbientTranscription] Transcription complete', {
            segmentCount: result.segments.length,
          })
          setSegments(result.segments)
          setState('reviewed')
        } catch (error) {
          console.error('[AmbientTranscription] Transcription failed', error)
          // Reset to idle on error
          setState('idle')
          setSegments([])
          // Show error alert to user
          alert(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      })()
    }
  }, [audioBlob, state, transcribeAudio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isRecording) {
        stopRecording()
      }
    }
  }, [isRecording, stopRecording])

  if (!isSupported) {
    return (
      <div className="rounded-lg border border-[var(--destructive)]/30 bg-[var(--destructive)]/10 px-4 py-3 text-sm text-[var(--destructive)]">
        Your browser does not support audio recording. Please use Chrome, Edge, or Safari.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recording / Processing Area */}
      {state === 'idle' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <button
            onClick={startRecording}
            disabled={isPending}
            aria-label="Start recording"
            className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 border-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] hover:shadow-[0_0_20px_var(--accent-cyan-glow)]"
          >
            <Mic className="h-8 w-8" />
          </button>
          <p className="text-sm text-[var(--muted-foreground)]">Click to start recording</p>
        </div>
      )}

      {state === 'recording' && (
        <div className="flex flex-col items-center gap-4 py-6">
          {/* Waveform animation */}
          <div className="flex items-center gap-1" style={{ height: '40px' }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div
                key={i}
                className="w-1 bg-[var(--accent-cyan)] rounded"
                style={{
                  animation: 'waveform 0.6s ease-in-out infinite',
                  animationDelay: `${i * 0.1}s`,
                  height: `${15 + i * 5}px`,
                }}
              />
            ))}
          </div>

          {/* Timer */}
          <p className="font-mono text-xl text-[var(--accent-cyan)]">{formatTime(elapsedSeconds)}</p>

          {/* Live transcript panel */}
          {liveTranscript ? (
            <div className="w-full max-w-lg rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-2 text-sm text-left overflow-y-auto max-h-48 font-mono">
              <p className="text-[var(--muted-foreground)] text-xs mb-1">
                Live transcript{isChunkTranscribing ? ' (updating…)' : ''}
              </p>
              <p className="text-[var(--foreground)] whitespace-pre-wrap">{liveTranscript}</p>
            </div>
          ) : elapsedSeconds < 20 ? (
            <p className="text-xs text-[var(--muted-foreground)]">
              Live transcript will appear after ~20 seconds…
            </p>
          ) : (
            <p className="text-xs text-[var(--muted-foreground)]">
              Processing first chunk…
            </p>
          )}

          {/* Stop button */}
          <button
            onClick={stopRecording}
            disabled={isPending}
            aria-label="Stop recording"
            className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)] shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <span
              className="absolute inset-0 rounded-full border-2 border-[var(--destructive)] opacity-75"
              style={{ animation: 'pulse-ring 1.5s ease-out infinite' }}
            />
            <MicOff className="h-8 w-8" />
          </button>

          <p className="text-sm text-[var(--muted-foreground)]">Click to stop recording</p>
        </div>
      )}

      {state === 'processing' && (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-cyan)]" />
          <p className="text-sm text-[var(--muted-foreground)]">Processing audio…</p>
        </div>
      )}

      {/* Reviewed transcript area */}
      {state === 'reviewed' && segments.length > 0 && (
        <div className="space-y-4">
          {/* Diarized transcript */}
          <div className="grid-bg relative rounded-md border border-[var(--input)] bg-[var(--card)] px-3 py-3 font-mono text-sm space-y-2">
            {segments.map((segment, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="font-semibold text-[var(--accent-cyan)] min-w-fit">
                  [{segment.speaker}]:
                </span>
                <span className="text-[var(--foreground)]">{segment.text}</span>
              </div>
            ))}
          </div>

          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Session title (optional)"
            disabled={isPending}
            className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] disabled:opacity-50"
          />

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                console.log('[AmbientTranscription] User clicked RE-RECORD')
                setState('idle')
                setSegments([])
                setTitle('')
                resetLiveTranscript()
              }}
              disabled={isPending}
              className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors disabled:pointer-events-none disabled:opacity-50"
            >
              <RotateCcw className="h-3 w-3" />
              Re-record
            </button>

            <Button
              onClick={() => {
                const fullText = segments.map(s => `${s.speaker}: ${s.text}`).join(' ')
                console.log('[AmbientTranscription] User clicked GENERATE NOTES', {
                  segmentCount: segments.length,
                  hasTitle: title.trim().length > 0,
                })
                onTranscriptReady(fullText, title)
              }}
              disabled={isPending || segments.length === 0}
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

      {/* CSS for waveform animation */}
      <style>{`
        @keyframes waveform {
          0%, 100% {
            transform: scaleY(0.4);
            opacity: 0.6;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
