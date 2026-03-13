import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { ScribeSession, SummarizeRequest, GenerateNotesRequest } from '@/types/scribe'

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
