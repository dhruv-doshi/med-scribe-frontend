'use client'

import { useState, useRef, useCallback } from 'react'

interface UseAudioRecorderReturn {
  startRecording: () => void
  stopRecording: () => void
  audioBlob: Blob | null
  isRecording: boolean
  elapsedSeconds: number
  isSupported: boolean
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia

  const startRecording = useCallback(async () => {
    if (!isSupported || isRecording) return

    try {
      console.log('[AudioRecorder] Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      // Fallback if opus not supported
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        const fallbackRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm',
        })
        mediaRecorderRef.current = fallbackRecorder
        console.log('[AudioRecorder] Using fallback audio/webm codec')
      } else {
        mediaRecorderRef.current = mediaRecorder
      }

      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onstart = () => {
        console.log('[AudioRecorder] Recording started')
        setIsRecording(true)
        setElapsedSeconds(0)
        // Start timer
        timerRef.current = setInterval(() => {
          setElapsedSeconds(prev => prev + 1)
        }, 1000)
      }

      mediaRecorderRef.current.onstop = () => {
        console.log('[AudioRecorder] Recording stopped')
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsRecording(false)
      }

      mediaRecorderRef.current.onerror = (event: Event) => {
        console.error('[AudioRecorder] Recording error', {
          error: (event as any).error,
        })
        setIsRecording(false)
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }

      mediaRecorderRef.current.start()
    } catch (error) {
      console.error('[AudioRecorder] Failed to start recording', error)
      setIsRecording(false)
    }
  }, [isSupported, isRecording])

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return

    console.log('[AudioRecorder] Stopping recording...')

    mediaRecorderRef.current.onstop = () => {
      // Assemble blob from chunks
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      setAudioBlob(blob)
      console.log('[AudioRecorder] Audio blob created', { size: blob.size })

      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsRecording(false)
    }

    mediaRecorderRef.current.stop()
  }, [isRecording])

  return {
    startRecording,
    stopRecording,
    audioBlob,
    isRecording,
    elapsedSeconds,
    isSupported,
  }
}
