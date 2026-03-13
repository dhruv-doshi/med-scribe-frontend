import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import HistoryList from '@/components/HistoryList'
import * as useScribeModule from '@/hooks/useScribe'
import type { ScribeSession } from '@/types/scribe'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('@/hooks/useScribe', () => ({
  useScribeHistory: vi.fn(),
}))

const mockHistory = vi.spyOn(useScribeModule, 'useScribeHistory')

const sessions: ScribeSession[] = [
  {
    id: 'abc-123',
    type: 'summarize',
    status: 'completed',
    result: null,
    created_at: '2026-03-13T10:00:00Z',
  },
  {
    id: 'def-456',
    type: 'generate',
    status: 'failed',
    result: null,
    created_at: '2026-03-12T09:00:00Z',
  },
]

describe('HistoryList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while fetching', () => {
    mockHistory.mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof useScribeModule.useScribeHistory>)
    render(<HistoryList />)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('shows empty state when no sessions', () => {
    mockHistory.mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useScribeModule.useScribeHistory>)
    render(<HistoryList />)
    expect(screen.getByText('No sessions yet.')).toBeInTheDocument()
    expect(screen.getByText('Start scribing →')).toBeInTheDocument()
  })

  it('renders session list with correct labels', () => {
    mockHistory.mockReturnValue({ data: sessions, isLoading: false } as unknown as ReturnType<typeof useScribeModule.useScribeHistory>)
    render(<HistoryList />)
    expect(screen.getByText('Summarization')).toBeInTheDocument()
    expect(screen.getByText('Note Generation')).toBeInTheDocument()
  })

  it('renders correct status badges', () => {
    mockHistory.mockReturnValue({ data: sessions, isLoading: false } as unknown as ReturnType<typeof useScribeModule.useScribeHistory>)
    render(<HistoryList />)
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('failed')).toBeInTheDocument()
  })

  it('links to correct session detail pages', () => {
    mockHistory.mockReturnValue({ data: sessions, isLoading: false } as unknown as ReturnType<typeof useScribeModule.useScribeHistory>)
    render(<HistoryList />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/scribe/abc-123')
    expect(links[1]).toHaveAttribute('href', '/scribe/def-456')
  })
})
