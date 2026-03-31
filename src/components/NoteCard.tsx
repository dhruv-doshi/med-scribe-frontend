import type { NoteGenerationResult } from '@/types/scribe'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SOAP_COLORS: Record<string, string> = {
  subjective: 'text-[var(--accent-cyan)]',
  objective:  'text-[var(--accent-green)]',
  assessment: 'text-amber-500',
  plan:       'text-[var(--destructive)]',
}

interface NoteCardProps {
  result: NoteGenerationResult
  isEditing?: boolean
  editValue?: NoteGenerationResult
  onEditChange?: (updated: NoteGenerationResult) => void
}

export default function NoteCard({
  result,
  isEditing = false,
  editValue,
  onEditChange,
}: NoteCardProps) {
  const displayResult = isEditing && editValue ? editValue : result

  const handleFieldChange = (field: keyof NoteGenerationResult, value: any) => {
    if (!onEditChange || !editValue) return
    onEditChange({
      ...editValue,
      [field]: value,
    })
  }

  const handleArrayFieldChange = (field: keyof NoteGenerationResult, value: string) => {
    if (!onEditChange || !editValue) return
    const arrayValue = value
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
    onEditChange({
      ...editValue,
      [field]: arrayValue,
    })
  }

  return (
    <div className="space-y-4">
      {/* Title */}
      {displayResult.title && (
        isEditing ? (
          <input
            type="text"
            value={displayResult.title}
            onChange={e => handleFieldChange('title', e.target.value)}
            className="w-full font-serif text-2xl border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)]"
          />
        ) : (
          <h2 className="font-serif text-2xl">{displayResult.title}</h2>
        )
      )}

      {/* Summary */}
      {displayResult.summary && (
        isEditing ? (
          <textarea
            value={displayResult.summary}
            onChange={e => handleFieldChange('summary', e.target.value)}
            className="w-full text-[var(--muted-foreground)] border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
            rows={2}
          />
        ) : (
          <p className="text-[var(--muted-foreground)]">{displayResult.summary}</p>
        )
      )}

      {/* SOAP notes */}
      {displayResult.subjective && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key, idx) => displayResult[key] && (
            <Card
              key={key}
              className="scan-card card-glow animate-fade-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <CardHeader>
                <CardTitle className={`text-sm uppercase tracking-wide ${SOAP_COLORS[key]}`}>
                  {key}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <textarea
                    value={displayResult[key] || ''}
                    onChange={e => handleFieldChange(key, e.target.value)}
                    className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                    rows={4}
                  />
                ) : (
                  <p className="text-sm">{displayResult[key]}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Medications */}
      {displayResult.medications && displayResult.medications.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Medications</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={(displayResult.medications || []).map(med =>
                  typeof med === 'string' ? med : `${med.name} - ${med.dosage} ${med.route}`
                ).join('\n')}
                onChange={e => handleArrayFieldChange('medications', e.target.value)}
                className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                rows={3}
                placeholder="One medication per line"
              />
            ) : (
              <ul className="space-y-1">
                {displayResult.medications.map((med, i) => {
                  const medText = typeof med === 'string'
                    ? med
                    : `${med.name} - ${med.dosage} ${med.route}`
                  return (
                    <li key={i} className="text-sm">• {medText}</li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Follow-up */}
      {displayResult.follow_up && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Follow-up</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={displayResult.follow_up}
                onChange={e => handleFieldChange('follow_up', e.target.value)}
                className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                rows={3}
              />
            ) : (
              <p className="text-sm">{displayResult.follow_up}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* General sections */}
      {displayResult.sections?.map((section, i) => (
        <Card key={i} className="scan-card card-glow animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CardHeader><CardTitle>{section.heading}</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={section.content}
                onChange={e => {
                  if (!onEditChange || !editValue) return
                  const newSections = (editValue.sections || []).map((s, idx) =>
                    idx === i ? { ...s, content: e.target.value } : s
                  )
                  onEditChange({ ...editValue, sections: newSections })
                }}
                className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                rows={4}
              />
            ) : (
              <p className="text-sm whitespace-pre-wrap">{section.content}</p>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Action Items */}
      {displayResult.action_items && displayResult.action_items.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Action Items</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={(displayResult.action_items || []).map(item =>
                  typeof item === 'string' ? item : JSON.stringify(item)
                ).join('\n')}
                onChange={e => handleArrayFieldChange('action_items', e.target.value)}
                className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                rows={3}
                placeholder="One action item per line"
              />
            ) : (
              <ul className="space-y-2">
                {displayResult.action_items.map((item, i) => {
                  const itemText = typeof item === 'string' ? item : JSON.stringify(item)
                  return (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border)]" />
                      {itemText}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      {displayResult.findings && displayResult.findings.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
          <CardContent>
            {isEditing ? (
              <textarea
                value={(displayResult.findings || []).map(f =>
                  typeof f === 'string' ? f : JSON.stringify(f)
                ).join('\n')}
                onChange={e => handleArrayFieldChange('findings', e.target.value)}
                className="w-full text-sm border border-[var(--input)] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--accent-cyan)] resize-none"
                rows={3}
                placeholder="One finding per line"
              />
            ) : (
              <ul className="space-y-1">
                {displayResult.findings.map((f, i) => {
                  const findingText = typeof f === 'string' ? f : JSON.stringify(f)
                  return (
                    <li key={i} className="text-sm">• {findingText}</li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
