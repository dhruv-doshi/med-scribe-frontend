import AuthCard from '@/components/auth/AuthCard'
import RegisterForm from '@/components/auth/RegisterForm'
export const metadata = { title: 'Create Account — Med Scribe' }
export default function RegisterPage() {
  return (
    <AuthCard title="Get started" subtitle="Create your Med Scribe account">
      <RegisterForm />
    </AuthCard>
  )
}
