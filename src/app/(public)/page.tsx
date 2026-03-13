import Link from 'next/link'
import { ROUTES } from '@/constants/routes'
import { FileText, Zap, Stethoscope, ShieldCheck } from 'lucide-react'
import EcgLine from '@/components/EcgLine'

const FEATURES = [
  {
    icon: FileText,
    title: 'Text Summarization',
    desc: 'Condense lengthy clinical notes and research papers into concise, actionable summaries.',
  },
  {
    icon: Stethoscope,
    title: 'SOAP Notes',
    desc: 'Automatically structure unformatted clinical text into Subjective, Objective, Assessment, Plan format.',
  },
  {
    icon: Zap,
    title: 'Multiple Formats',
    desc: 'Generate meeting minutes, research notes, and general structured notes from any text input.',
  },
  {
    icon: ShieldCheck,
    title: 'HIPAA-Ready',
    desc: 'Built with healthcare compliance in mind — your patient data stays secure and private.',
  },
]

const STATS = [
  { value: '10K+', label: 'Notes Generated' },
  { value: '500+', label: 'Physicians' },
  { value: '99.9%', label: 'Uptime' },
]

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* ECG background */}
        <div className="absolute inset-x-0 top-1/2 h-24 -translate-y-1/2 opacity-20">
          <EcgLine />
        </div>
        {/* Fade overlay */}
        <div className="hero-fade absolute inset-0 pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <h1 className="font-serif text-5xl font-bold leading-tight text-[var(--foreground)] sm:text-6xl lg:text-7xl">
            Doctors Document.{' '}
            <span className="text-gradient">AI Remembers.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--muted-foreground)]">
            Summarize clinical text and generate structured SOAP notes, meeting minutes, and research notes — in seconds.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href={ROUTES.REGISTER}
              className="rounded-full bg-[var(--accent-cyan)] px-8 py-3 font-medium text-white shadow-[0_0_20px_var(--accent-cyan-glow)] transition-opacity hover:opacity-90"
            >
              Start Scribing
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="rounded-full border border-[var(--border)] px-8 py-3 font-medium transition-colors hover:bg-[var(--secondary)]"
            >
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-8">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-serif text-2xl font-bold text-[var(--accent-cyan)]">{value}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="scan-card card-glow rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-cyan)]/10 ring-1 ring-[var(--accent-cyan)]/20">
                <Icon className="h-5 w-5 text-[var(--accent-cyan)]" />
              </div>
              <h3 className="mb-2 font-semibold">{title}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
