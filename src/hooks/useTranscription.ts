'use client'

import { useState, useRef, useCallback } from 'react'
import { redactHealthInfo } from '@/lib/log-sanitizer'

// Declare SpeechRecognition interface for Web Speech API
declare global {
  interface SpeechRecognitionEvent extends Event {
    resultIndex: number
    results: SpeechRecognitionResultList
  }

  interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
  }

  interface SpeechRecognitionResult {
    readonly length: number
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
    readonly isFinal: boolean
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    onstart: ((event: Event) => void) | null
    onresult: ((event: SpeechRecognitionEvent) => void) | null
    onend: ((event: Event) => void) | null
    onerror: ((event: Event) => void) | null
    start(): void
    stop(): void
    abort(): void
  }

  interface Window {
    SpeechRecognition?: new () => SpeechRecognition
    webkitSpeechRecognition?: new () => SpeechRecognition
  }
}

interface UseTranscriptionReturn {
  transcript: string
  interimText: string
  isRecording: boolean
  isSupported: boolean
  startRecording: () => void
  stopRecording: () => void
  clearTranscript: () => void
}

export function useTranscription(): UseTranscriptionReturn {
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const startRecording = useCallback(() => {
    if (!isSupported || isRecording) return

    console.log('[Transcription] Starting recording...')
    const SpeechRecognitionAPI =
      window.SpeechRecognition ?? window.webkitSpeechRecognition!

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    console.log('[Transcription] SpeechRecognition initialized', {
      continuous: true,
      interimResults: true,
      lang: 'en-US',
    })

    recognition.onstart = () => {
      console.log('[Transcription] Recording started - microphone is active')
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript
        } else {
          interimChunk += result[0].transcript
        }
      }
      if (finalChunk) {
        console.log('[Transcription] Final transcript received', {
          chunk: redactHealthInfo(finalChunk),
          confidence: event.results[event.results.length - 1]?.[0]?.confidence,
        })
        setTranscript(prev => prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim())
      }
      if (interimChunk) {
        console.log('[Transcription] Interim result (in-progress)', { text: redactHealthInfo(interimChunk) })
      }
      setInterimText(interimChunk)
    }

    recognition.onend = () => {
      console.log('[Transcription] Recording stopped - microphone deactivated')
      setIsRecording(false)
      setInterimText('')
    }

    recognition.onerror = (event: Event) => {
      console.error('[Transcription] Recording error', {
        error: (event as any).error,
      })
      setIsRecording(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [isSupported, isRecording])

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const clearTranscript = useCallback(() => {
    setTranscript('')
    setInterimText('')
  }, [])

  return {
    transcript,
    interimText,
    isRecording,
    isSupported,
    startRecording,
    stopRecording,
    clearTranscript,
  }
}
