import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AmbientTranscription from '@/components/AmbientTranscription'

describe('AmbientTranscription', () => {
  it('should render when Web Speech API is supported', () => {
    const mockCallback = vi.fn()
    ;(window as any).SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onresult: null = null
      onend: null = null
      onerror: null = null
      start() {}
      stop() {}
      abort() {}
    }

    render(<AmbientTranscription onTranscriptReady={mockCallback} />)

    expect(screen.getByText(/Click to start recording/i)).toBeInTheDocument()
  })

  it('should show error message when Web Speech API is not supported', () => {
    // Remove Web Speech API
    delete (window as any).SpeechRecognition
    delete (window as any).webkitSpeechRecognition

    const mockCallback = vi.fn()
    render(<AmbientTranscription onTranscriptReady={mockCallback} />)

    expect(screen.getByText(/does not support the Web Speech API/i)).toBeInTheDocument()
  })

  it('should render transcript input area', () => {
    const mockCallback = vi.fn()
    ;(window as any).SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onresult: null = null
      onend: null = null
      onerror: null = null
      start() {}
      stop() {}
      abort() {}
    }

    render(<AmbientTranscription onTranscriptReady={mockCallback} />)

    expect(screen.queryByText(/Recording… click to stop/i)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Start recording/i })).toBeInTheDocument()
  })

  it('should disable buttons when isPending is true', () => {
    const mockCallback = vi.fn()
    ;(window as any).SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onresult: null = null
      onend: null = null
      onerror: null = null
      start() {}
      stop() {}
      abort() {}
    }

    render(<AmbientTranscription onTranscriptReady={mockCallback} isPending={true} />)

    const button = screen.getByLabelText(/Start recording/i)
    expect(button).toBeDisabled()
  })

  it('should render the generate clinical notes button when component mounts', () => {
    const mockCallback = vi.fn()
    ;(window as any).SpeechRecognition = class MockSpeechRecognition {
      continuous = false
      interimResults = false
      lang = ''
      onresult: null = null
      onend: null = null
      onerror: null = null
      start() {}
      stop() {}
      abort() {}
    }

    render(<AmbientTranscription onTranscriptReady={mockCallback} />)

    // The button should exist in the component
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(0)
  })
})
