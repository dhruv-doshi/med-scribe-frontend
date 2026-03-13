import ScribeEditor from '@/components/ScribeEditor'
import { Activity } from 'lucide-react'

export const metadata = { title: 'Scribe — MedScribe' }

export default function ScribePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 font-serif text-3xl">
          <Activity className="h-7 w-7 text-[var(--accent-cyan)]" />
          AI Scribe
        </h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Paste clinical text to summarize or generate structured notes instantly.
        </p>
      </div>
      <ScribeEditor />
    </div>
  )
}
