import type { SummarizationResult } from '@/types/scribe'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const ENTITY_STYLES: Record<string, string> = {
  medications: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)]',
  conditions:  'bg-[var(--destructive)]/10 text-[var(--destructive)]',
  procedures:  'bg-[var(--accent-green)]/10 text-[var(--accent-green)]',
}

export default function SummarizationResultView({ result }: { result: SummarizationResult }) {
  return (
    <div className="animate-fade-up space-y-4">
      <Card className="scan-card card-glow">
        <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-relaxed">{result.summary}</p></CardContent>
      </Card>

      {result.key_points?.length > 0 && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Key Points</CardTitle></CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.key_points.map((point, i) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-[var(--accent-cyan)]">•</span>{point}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {result.entities && (
        <Card className="scan-card card-glow">
          <CardHeader><CardTitle>Extracted Entities</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {(['medications', 'conditions', 'procedures'] as const).map(cat => (
                result.entities[cat].length > 0 && (
                  <div key={cat}>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">{cat}</p>
                    {result.entities[cat].map((e, i) => (
                      <span
                        key={i}
                        className={`mr-1 mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${ENTITY_STYLES[cat]}`}
                      >
                        {e}
                      </span>
                    ))}
                  </div>
                )
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <p className="font-mono text-xs text-[var(--muted-foreground)] text-right">
        {result.word_count} words processed
      </p>
    </div>
  )
}
