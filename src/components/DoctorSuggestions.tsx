'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { DoctorSuggestion, DoctorSuggestionAnswer } from '@/types/scribe'

interface DoctorSuggestionsProps {
  suggestions: DoctorSuggestion[]
  savedAnswers?: DoctorSuggestionAnswer[]
  onSave: (answers: DoctorSuggestionAnswer[]) => void
  isSaving?: boolean
}

export default function DoctorSuggestions({
  suggestions,
  savedAnswers,
  onSave,
  isSaving = false,
}: DoctorSuggestionsProps) {
  const [answers, setAnswers] = useState<Record<string, DoctorSuggestionAnswer>>({})

  // Initialize from savedAnswers on mount
  useEffect(() => {
    if (savedAnswers && savedAnswers.length > 0) {
      const answerMap = Object.fromEntries(
        savedAnswers.map(a => [a.suggestion_id, a])
      )
      setAnswers(answerMap)
    }
  }, [savedAnswers])

  const handleSelectOption = (suggestionId: string, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [suggestionId]: {
        suggestion_id: suggestionId,
        selected_option: option,
        custom_answer: '',
      },
    }))
  }

  const handleCustomAnswer = (suggestionId: string, customText: string) => {
    setAnswers(prev => ({
      ...prev,
      [suggestionId]: {
        suggestion_id: suggestionId,
        selected_option: null,
        custom_answer: customText,
      },
    }))
  }

  const handleSave = async () => {
    const answersArray = Object.values(answers)
    console.log('[DoctorSuggestions] Saving answers', { count: answersArray.length })
    try {
      await onSave(answersArray)
    } catch (error) {
      console.error('[DoctorSuggestions] Failed to save answers', error)
      alert('Failed to save observations. Please try again.')
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      {/* Section Header */}
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          Doctor Observations
        </h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Answer these clinical observation questions based on your exam findings.
        </p>
      </div>

      {/* Suggestions */}
      <div className="space-y-6">
        {suggestions.map((suggestion, idx) => {
          const answer = answers[suggestion.id]
          const hasCustom = answer?.custom_answer?.trim() ?? ''
          const hasSelected = answer?.selected_option ?? null

          return (
            <div
              key={suggestion.id}
              className="pb-6 border-b border-[var(--border)]/30 last:border-b-0 last:pb-0"
            >
              {/* Question */}
              <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                {idx + 1}. {suggestion.question}
              </p>

              {/* Options (MCQ) */}
              <div className="space-y-2 mb-4">
                {suggestion.options.map(option => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--secondary)] transition-colors"
                  >
                    <input
                      type="radio"
                      name={`suggestion-${suggestion.id}`}
                      checked={hasSelected === option}
                      onChange={() => handleSelectOption(suggestion.id, option)}
                      disabled={isSaving}
                      className="w-4 h-4 text-[var(--accent-cyan)] cursor-pointer"
                    />
                    <span className="text-sm text-[var(--foreground)]">{option}</span>
                  </label>
                ))}
              </div>

              {/* Custom Answer Textarea */}
              <textarea
                value={hasCustom}
                onChange={e => handleCustomAnswer(suggestion.id, e.target.value)}
                placeholder="Add your own observation..."
                disabled={isSaving}
                className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] disabled:opacity-50 resize-none"
                rows={3}
              />
            </div>
          )
        })}
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || suggestions.length === 0}
          size="pill"
          className="shadow-[0_0_12px_var(--accent-cyan-glow)]"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            'Save Observations'
          )}
        </Button>
      </div>
    </div>
  )
}
