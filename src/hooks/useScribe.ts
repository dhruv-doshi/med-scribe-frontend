import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type {
  ScribeSession,
  SummarizeRequest,
  GenerateNotesRequest,
  TranscribeResult,
  DoctorSuggestionAnswer,
  UpdateSessionRequest,
} from '@/types/scribe'

export function useSummarize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: SummarizeRequest): Promise<ScribeSession> => {
      const res = await apiClient.post('/scribe/summarize', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scribe-history'] }),
  })
}

export function useGenerateNotes() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: GenerateNotesRequest): Promise<ScribeSession> => {
      const res = await apiClient.post('/scribe/generate', data)
      return res.data.data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['scribe-history'] }),
  })
}

export function useScribeHistory() {
  return useQuery({
    queryKey: ['scribe-history'],
    queryFn: async (): Promise<ScribeSession[]> => {
      const res = await apiClient.get('/scribe/history')
      return res.data.data
    },
  })
}

export function useScribeSession(id: string) {
  return useQuery({
    queryKey: ['scribe-session', id],
    queryFn: async (): Promise<ScribeSession> => {
      const res = await apiClient.get(`/scribe/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useTranscribeAudio() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (audioBlob: Blob): Promise<TranscribeResult> => {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')
      // ⚠️ IMPORTANT: Override timeout to 180 seconds (180_000ms)
      // Default Axios timeout (30s) is too short for audio transcription.
      // A 3-minute consultation takes 60-90 seconds to transcribe on CPU.
      const res = await apiClient.post('/scribe/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 180_000, // 3-minute timeout for transcription
      })
      return res.data.data
    },
  })
}

export function useSaveDoctorAnswers(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (answers: DoctorSuggestionAnswer[]): Promise<ScribeSession> => {
      const res = await apiClient.post(`/scribe/${sessionId}/doctor-answers`, { answers })
      if (!res.data.data) {
        throw new Error('Backend returned invalid response for doctor answers')
      }
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scribe-session', sessionId] })
    },
    onError: (error) => {
      console.error('[useSaveDoctorAnswers] Error', error)
    },
  })
}

export function useUpdateSession(sessionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateSessionRequest): Promise<ScribeSession> => {
      const res = await apiClient.patch(`/scribe/${sessionId}`, data)
      return res.data.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scribe-session', sessionId] })
      qc.invalidateQueries({ queryKey: ['scribe-history'] })
    },
  })
}

export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      await apiClient.delete(`/scribe/${sessionId}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scribe-history'] })
    },
  })
}
