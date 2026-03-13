export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left brand panel — always dark */}
      <div className="auth-brand-panel hidden w-[420px] shrink-0 flex-col justify-between p-12 lg:flex">
        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#00D4FF]/15 ring-1 ring-[#00D4FF]/40">
            <svg className="h-4 w-4 text-[#00D4FF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="font-serif text-lg font-semibold text-[#E8F4FD]">MedScribe</span>
        </div>

        {/* Tagline */}
        <div>
          <p className="font-serif text-4xl font-bold leading-tight text-[#E8F4FD]">
            The AI scribe<br />
            <span style={{ background: 'linear-gradient(135deg, #00D4FF, #00E5A0)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              clinicians trust.
            </span>
          </p>
          <p className="mt-4 text-sm text-[#6B9AB5]">
            Generate structured clinical notes from raw dictation in seconds.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { value: '10K+', label: 'Notes' },
              { value: '500+', label: 'Physicians' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <div key={label} className="rounded-lg border border-[#1A3050] bg-[#0A1628] p-3 text-center">
                <p className="font-serif text-lg font-bold text-[#00D4FF]">{value}</p>
                <p className="text-xs text-[#6B9AB5]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trusted line */}
        <div className="flex items-center gap-2 text-sm text-[#6B9AB5]">
          <span className="pulse-dot" />
          Trusted by physicians worldwide
        </div>
      </div>

      {/* Right: form panel */}
      <div className="flex flex-1 items-center justify-center bg-[var(--background)] px-4 py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
