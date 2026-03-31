'use client'

import { useState, useEffect } from 'react'
import type { DoctorSuggestion, DoctorSuggestionAnswer } from '@/types/scribe'

interface DoctorSuggestionsProps {
  suggestions: DoctorSuggestion[]
  savedAnswers?: DoctorSuggestionAnswer[]
  onAnswerChange: (answers: DoctorSuggestionAnswer[]) => void
  isSaving?: boolean
  mode: 'edit' | 'view'
}

export default function DoctorSuggestions({
  suggestions,
  savedAnswers,
  onAnswerChange,
  isSaving = false,
  mode,
}: DoctorSuggestionsProps) {
  const [answers, setAnswers] = useState<Record<string, DoctorSuggestionAnswer>>({})

  // Initialize from savedAnswers; shim old selected_option → selected_options
  useEffect(() => {
    if (!savedAnswers?.length) return
    const map = Object.fromEntries(
      savedAnswers.map(a => [a.suggestion_id, {
        ...a,
        selected_options: (a as any).selected_options ??
          ((a as any).selected_option ? [(a as any).selected_option] : []),
      }])
    )
    setAnswers(map)
  }, [savedAnswers])

  const handleToggleOption = (suggestionId: string, option: string) => {
    setAnswers(prev => {
      const cur = prev[suggestionId] ?? {
        suggestion_id: suggestionId,
        selected_options: [],
        custom_answer: '',
      }
      const already = cur.selected_options.includes(option)
      const updated: DoctorSuggestionAnswer = {
        ...cur,
        selected_options: already
          ? cur.selected_options.filter(o => o !== option)
          : [...cur.selected_options, option],
      }
      const next = { ...prev, [suggestionId]: updated }
      onAnswerChange(Object.values(next))
      return next
    })
  }

  const handleCustomAnswer = (suggestionId: string, customText: string) => {
    setAnswers(prev => {
      const cur = prev[suggestionId] ?? {
        suggestion_id: suggestionId,
        selected_options: [],
        custom_answer: '',
      }
      const updated: DoctorSuggestionAnswer = { ...cur, custom_answer: customText }
      const next = { ...prev, [suggestionId]: updated }
      onAnswerChange(Object.values(next))
      return next
    })
  }

  // ── VIEW MODE ────────────────────────────────────────────────────────────────
  if (mode === 'view') {
    const answered = suggestions.filter(s => {
      const a = answers[s.id]
      return a && (a.selected_options.length > 0 || a.custom_answer.trim().length > 0)
    })
    if (answered.length === 0) return null

    return (
      <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="mb-4 border-b border-[var(--border)] pb-4">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Doctor Observations</h2>
        </div>
        <div className="space-y-4">
          {answered.map(suggestion => {
            const a = answers[suggestion.id]
            return (
              <div key={suggestion.id} className="pb-4 border-b border-[var(--border)]/30 last:border-b-0 last:pb-0">
                <p className="text-sm font-medium text-[var(--muted-foreground)] mb-2">
                  {suggestion.question}
                </p>
                {a.selected_options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-1">
                    {a.selected_options.map(opt => (
                      <span
                        key={opt}
                        className="inline-flex items-center rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 px-2.5 py-0.5 text-xs text-[var(--accent-cyan)]"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
                {a.custom_answer.trim() && (
                  <p className="text-sm text-[var(--foreground)]">{a.custom_answer.trim()}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── EDIT MODE ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Doctor Observations</h2>
        <p className="text-xs text-[var(--muted-foreground)] mt-1">
          Answer these clinical observation questions. Multiple options may be selected.
        </p>
      </div>

      <div className="space-y-6">
        {suggestions.map((suggestion, idx) => {
          const answer = answers[suggestion.id]
          const selectedOptions = answer?.selected_options ?? []
          const customText = answer?.custom_answer ?? ''

          return (
            <div
              key={suggestion.id}
              className="pb-6 border-b border-[var(--border)]/30 last:border-b-0 last:pb-0"
            >
              <p className="text-sm font-medium text-[var(--foreground)] mb-3">
                {idx + 1}. {suggestion.question}
              </p>

              <div className="space-y-2 mb-4">
                {suggestion.options.map(option => (
                  <label
                    key={option}
                    className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[var(--secondary)] transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option)}
                      onChange={() => handleToggleOption(suggestion.id, option)}
                      disabled={isSaving}
                      className="w-4 h-4 rounded text-[var(--accent-cyan)] cursor-pointer"
                    />
                    <span className="text-sm text-[var(--foreground)]">{option}</span>
                  </label>
                ))}
              </div>

              <textarea
                value={customText}
                onChange={e => handleCustomAnswer(suggestion.id, e.target.value)}
                placeholder="Add your own observation…"
                disabled={isSaving}
                className="w-full rounded-md border border-[var(--input)] bg-transparent px-3 py-2 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] disabled:opacity-50 resize-none"
                rows={2}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
