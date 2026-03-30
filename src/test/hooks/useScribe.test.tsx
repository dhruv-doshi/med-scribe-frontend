import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import React from 'react'
import apiClient from '@/lib/api-client'
import { useSummarize, useGenerateNotes, useScribeHistory, useScribeSession } from '@/hooks/useScribe'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('useScribe hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useSummarize', () => {
    it('should successfully summarize text', async () => {
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'summarize',
        status: 'completed',
        result: {
          summary: 'Test summary',
          key_points: ['Point 1', 'Point 2'],
          entities: { medications: [], conditions: [], procedures: [] },
          word_count: 50,
        },
        created_at: new Date().toISOString(),
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockSession },
      } as any)

      const { result } = renderHook(() => useSummarize(), { wrapper: createWrapper() })

      const response = await result.current.mutateAsync({ text: 'Test text' })

      expect(response).toEqual(mockSession)
      expect(apiClient.post).toHaveBeenCalledWith('/scribe/summarize', { text: 'Test text' })
    })

    it('should handle summarize errors', async () => {
      const error = new Error('API Error')
      vi.mocked(apiClient.post).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useSummarize(), { wrapper: createWrapper() })

      await expect(result.current.mutateAsync({ text: 'Test text' })).rejects.toThrow('API Error')
    })
  })

  describe('useGenerateNotes', () => {
    it('should successfully generate clinical notes from transcript', async () => {
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'generate',
        status: 'completed',
        result: {
          subjective: 'Patient-reported symptoms',
          objective: 'Clinical observations',
          assessment: 'Probable diagnosis',
          plan: 'Treatment plan',
          medications: ['Med 1'],
          follow_up: 'Follow-up instructions',
        },
        created_at: new Date().toISOString(),
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockSession },
      } as any)

      const { result } = renderHook(() => useGenerateNotes(), { wrapper: createWrapper() })

      const response = await result.current.mutateAsync({
        text: 'Patient presents with...',
        note_type: 'clinical',
      })

      expect(response).toEqual(mockSession)
      expect(apiClient.post).toHaveBeenCalledWith('/scribe/generate', {
        text: 'Patient presents with...',
        note_type: 'clinical',
      })
    })

    it('should generate notes with different note types', async () => {
      const mockSession = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        type: 'generate',
        status: 'completed',
        result: { title: 'Test', sections: [], action_items: [], summary: 'Test' },
        created_at: new Date().toISOString(),
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { data: mockSession },
      } as any)

      const { result } = renderHook(() => useGenerateNotes(), { wrapper: createWrapper() })

      await result.current.mutateAsync({
        text: 'Meeting notes...',
        note_type: 'meeting',
      })

      expect(apiClient.post).toHaveBeenCalledWith('/scribe/generate', {
        text: 'Meeting notes...',
        note_type: 'meeting',
      })
    })
  })

  describe('useScribeHistory', () => {
    it('should fetch scribe history', async () => {
      const mockHistory = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          type: 'generate',
          status: 'completed',
          result: null,
          created_at: new Date().toISOString(),
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174000',
          type: 'summarize',
          status: 'completed',
          result: null,
          created_at: new Date().toISOString(),
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockHistory },
      } as any)

      const { result } = renderHook(() => useScribeHistory(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockHistory)
      expect(apiClient.get).toHaveBeenCalledWith('/scribe/history')
    })

    it('should handle history fetch errors', async () => {
      const error = new Error('Fetch failed')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useScribeHistory(), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })

  describe('useScribeSession', () => {
    it('should fetch a specific scribe session', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const mockSession = {
        id: sessionId,
        type: 'generate',
        status: 'completed',
        result: {
          subjective: 'Test',
          objective: 'Test',
          assessment: 'Test',
          plan: 'Test',
          medications: [],
          follow_up: 'Test',
        },
        created_at: new Date().toISOString(),
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: { data: mockSession },
      } as any)

      const { result } = renderHook(() => useScribeSession(sessionId), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockSession)
      expect(apiClient.get).toHaveBeenCalledWith(`/scribe/${sessionId}`)
    })

    it('should not call API when id is empty', () => {
      vi.mocked(apiClient.get).mockClear()

      renderHook(() => useScribeSession(''), { wrapper: createWrapper() })

      expect(apiClient.get).not.toHaveBeenCalled()
    })

    it('should handle session fetch errors', async () => {
      const sessionId = '123e4567-e89b-12d3-a456-426614174000'
      const error = new Error('Not found')
      vi.mocked(apiClient.get).mockRejectedValueOnce(error)

      const { result } = renderHook(() => useScribeSession(sessionId), { wrapper: createWrapper() })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(error)
    })
  })
})
