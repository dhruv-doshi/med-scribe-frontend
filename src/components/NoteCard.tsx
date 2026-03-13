import type { NoteGenerationResult } from '@/types/scribe'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const SOAP_COLORS: Record<string, string> = {
  subjective: 'text-[var(--accent-cyan)]',
  objective:  'text-[var(--accent-green)]',
  assessment: 'text-amber-500',
  plan:       'text-[var(--destructive)]',
}

export default function NoteCard({ result }: { result: NoteGenerationResult }) {
  return (
    <div className="space-y-4">
      {result.title && <h2 className="font-serif text-2xl">{result.title}</h2>}
      {result.summary && <p className="text-[var(--muted-foreground)]">{result.summary}</p>}

      {/* SOAP notes */}
      {result.subjective && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(['subjective', 'objective', 'assessment', 'plan'] as const).map((key, idx) => result[key] && (
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
              <CardContent><p className="text-sm">{result[key]}</p></CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* General sections */}
      {result.sections?.map((section, i) => (
        <Card key={i} className="scan-card card-glow animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
          <CardHeader><CardTitle>{section.heading}</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{section.content}</p></CardContent>
        </Card>
      ))}

      {result.action_items && result.action_items.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Action Items</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.action_items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-[var(--border)]" />
                  {typeof item === 'string' ? item : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.findings && result.findings.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {result.findings.map((f, i) => <li key={i} className="text-sm">• {f}</li>)}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
