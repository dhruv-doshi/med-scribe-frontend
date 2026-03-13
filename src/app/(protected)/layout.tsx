import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { ROUTES } from '@/constants/routes'
import AppShell from '@/components/AppShell'

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect(ROUTES.LOGIN)
  return <AppShell>{children}</AppShell>
}
