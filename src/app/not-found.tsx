import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="font-serif text-4xl">404</h1>
      <p className="text-[var(--muted-foreground)]">Page not found</p>
      <Link href="/" className="text-[var(--accent)] hover:underline">Go home</Link>
    </div>
  )
}
