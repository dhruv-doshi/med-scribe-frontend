import { useRef, useState, useEffect } from 'react'
import apiClient from '@/lib/api-client'

function stitch(previous: string, newChunk: string): string {
  if (!previous) return newChunk.trim()
  if (!newChunk.trim()) return previous

  const prevWords = previous.trim().split(/\s+/)
  const newWords = newChunk.trim().split(/\s+/)
  const maxSearch = Math.min(30, prevWords.length, newWords.length)

  for (let len = maxSearch; len >= 2; len--) {
    const suffix = prevWords.slice(-len).join(' ').toLowerCase()
    const prefix = newWords.slice(0, len).join(' ').toLowerCase()
    if (suffix === prefix) {
      const newPart = newWords.slice(len).join(' ')
      return newPart ? previous + ' ' + newPart : previous
    }
  }
  return previous + ' ' + newChunk.trim()
}

interface UseLiveTranscriptionParams {
  isRecording: boolean
  getChunks: () => Blob[]
  mimeType: string
  chunkIntervalMs?: number  // default: 20000
  windowSeconds?: number    // default: 25
}

export function useLiveTranscription({
  isRecording,
  getChunks,
  mimeType,
  chunkIntervalMs = 20_000,
  windowSeconds = 25,
}: UseLiveTranscriptionParams) {
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isChunkTranscribing, setIsChunkTranscribing] = useState(false)
  const inFlightRef = useRef(false)
  const isMountedRef = useRef(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    inFlightRef.current = false

    intervalRef.current = setInterval(async () => {
      if (inFlightRef.current) return

      const allChunks = getChunks()
      if (allChunks.length < 5) return  // need at least ~5s of audio

      // Always include chunk[0] (EBML header/init segment) to produce a valid WebM.
      // Without it, slicing mid-recording yields raw media clusters with no container
      // header — failing the backend magic-bytes check.
      const windowChunks =
        allChunks.length <= windowSeconds
          ? allChunks
          : [allChunks[0], ...allChunks.slice(-(windowSeconds - 1))]

      // Normalize mimeType: strip codec param (e.g. "audio/webm;codecs=opus" → "audio/webm")
      // so it matches the backend's accepted format list.
      const normalizedMime = mimeType.split(';')[0]
      const blob = new Blob(windowChunks, { type: normalizedMime })

      inFlightRef.current = true
      setIsChunkTranscribing(true)
      try {
        const formData = new FormData()
        formData.append('audio', blob, 'chunk.webm')
        const res = await apiClient.post('/scribe/transcribe/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60_000,
        })
        if (!isMountedRef.current) return
        const newText: string = res.data?.data?.text ?? ''
        setLiveTranscript(prev => stitch(prev, newText))
      } catch {
        // Chunk failed — live transcript stays at previous value; no user-facing error
      } finally {
        inFlightRef.current = false
        if (isMountedRef.current) setIsChunkTranscribing(false)
      }
    }, chunkIntervalMs)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRecording, getChunks, mimeType, chunkIntervalMs, windowSeconds])

  const resetLiveTranscript = () => setLiveTranscript('')

  return { liveTranscript, isChunkTranscribing, resetLiveTranscript }
}
