import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import SummarizationResultView from '@/components/SummarizationResult'
import type { SummarizationResult } from '@/types/scribe'

const baseResult: SummarizationResult = {
  summary: 'Patient had a STEMI and received PCI.',
  key_points: ['ST elevation on ECG', 'Troponin elevated', 'PCI performed'],
  entities: {
    medications: ['aspirin', 'heparin'],
    conditions: ['STEMI', 'hypertension'],
    procedures: ['PCI'],
  },
  word_count: 42,
}

describe('SummarizationResultView', () => {
  it('renders the summary text', () => {
    render(<SummarizationResultView result={baseResult} />)
    expect(screen.getByText('Patient had a STEMI and received PCI.')).toBeInTheDocument()
  })

  it('renders key points', () => {
    render(<SummarizationResultView result={baseResult} />)
    expect(screen.getByText('Key Points')).toBeInTheDocument()
    expect(screen.getByText('ST elevation on ECG')).toBeInTheDocument()
    expect(screen.getByText('Troponin elevated')).toBeInTheDocument()
    expect(screen.getByText('PCI performed')).toBeInTheDocument()
  })

  it('renders extracted entities', () => {
    render(<SummarizationResultView result={baseResult} />)
    expect(screen.getByText('Extracted Entities')).toBeInTheDocument()
    expect(screen.getByText('aspirin')).toBeInTheDocument()
    expect(screen.getByText('heparin')).toBeInTheDocument()
    expect(screen.getByText('STEMI')).toBeInTheDocument()
    expect(screen.getByText('hypertension')).toBeInTheDocument()
    expect(screen.getByText('PCI')).toBeInTheDocument()
  })

  it('renders word count', () => {
    render(<SummarizationResultView result={baseResult} />)
    expect(screen.getByText('42 words processed')).toBeInTheDocument()
  })

  it('omits key points section when empty', () => {
    const result = { ...baseResult, key_points: [] }
    render(<SummarizationResultView result={result} />)
    expect(screen.queryByText('Key Points')).not.toBeInTheDocument()
  })

  it('omits entity categories when empty', () => {
    const result: SummarizationResult = {
      ...baseResult,
      entities: { medications: [], conditions: [], procedures: [] },
    }
    render(<SummarizationResultView result={result} />)
    // Section header present but no items
    expect(screen.getByText('Extracted Entities')).toBeInTheDocument()
    expect(screen.queryByText('aspirin')).not.toBeInTheDocument()
  })
})
