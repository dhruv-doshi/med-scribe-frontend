import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import NoteCard from '@/components/NoteCard'
import type { NoteGenerationResult } from '@/types/scribe'

describe('NoteCard', () => {
  it('renders SOAP notes when subjective is present', () => {
    const result: NoteGenerationResult = {
      subjective: 'Patient reports headache',
      objective: 'BP 130/85, afebrile',
      assessment: 'Migraine',
      plan: 'Sumatriptan prescribed',
      medications: ['sumatriptan'],
      follow_up: 'Return in 2 weeks',
    }
    render(<NoteCard result={result} />)
    expect(screen.getByText('subjective')).toBeInTheDocument()
    expect(screen.getByText('Patient reports headache')).toBeInTheDocument()
    expect(screen.getByText('objective')).toBeInTheDocument()
    expect(screen.getByText('assessment')).toBeInTheDocument()
    expect(screen.getByText('plan')).toBeInTheDocument()
  })

  it('renders general sections when present', () => {
    const result: NoteGenerationResult = {
      title: 'Team Meeting',
      sections: [
        { heading: 'Agenda', content: 'Review Q2 roadmap' },
        { heading: 'Decisions', content: 'Switch to microservices' },
      ],
    }
    render(<NoteCard result={result} />)
    expect(screen.getByText('Team Meeting')).toBeInTheDocument()
    expect(screen.getByText('Agenda')).toBeInTheDocument()
    expect(screen.getByText('Review Q2 roadmap')).toBeInTheDocument()
    expect(screen.getByText('Decisions')).toBeInTheDocument()
  })

  it('renders action items when present', () => {
    const result: NoteGenerationResult = {
      action_items: ['Write tests', 'Deploy to staging'],
    }
    render(<NoteCard result={result} />)
    expect(screen.getByText('Action Items')).toBeInTheDocument()
    expect(screen.getByText('Write tests')).toBeInTheDocument()
    expect(screen.getByText('Deploy to staging')).toBeInTheDocument()
  })

  it('renders findings when present', () => {
    const result: NoteGenerationResult = {
      findings: ['Exercise reduces mortality by 35%', 'Sample size 10000'],
    }
    render(<NoteCard result={result} />)
    expect(screen.getByText('Findings')).toBeInTheDocument()
    expect(screen.getByText('• Exercise reduces mortality by 35%')).toBeInTheDocument()
  })

  it('renders summary when present', () => {
    const result: NoteGenerationResult = {
      summary: 'This is a summary of the notes.',
    }
    render(<NoteCard result={result} />)
    expect(screen.getByText('This is a summary of the notes.')).toBeInTheDocument()
  })
})
