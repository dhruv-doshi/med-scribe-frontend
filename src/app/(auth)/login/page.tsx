import AuthCard from '@/components/auth/AuthCard'
import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'
export const metadata = { title: 'Sign In — Med Scribe' }
export default function LoginPage() {
  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your account">
      <Suspense fallback={null}><LoginForm /></Suspense>
    </AuthCard>
  )
}
