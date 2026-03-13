import NextAuth, { CredentialsSignin } from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import apiClient from '@/lib/api-client'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        try {
          const response = await apiClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          })
          const { user, accessToken } = response.data.data
          if (user && accessToken) {
            return { ...user, accessToken }
          }
          return null
        } catch (err) {
          const error = err as { response?: { data?: { code?: string } } }
          if (error?.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
            const e = new CredentialsSignin('Email not verified')
            e.code = 'email_not_verified'
            throw e
          }
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        // For credentials provider
        if ((user as { accessToken?: string }).accessToken) {
          token.accessToken = (user as { accessToken?: string }).accessToken
        }
      }
      // For OAuth providers, exchange for backend token
      if (account?.provider === 'google' && account.id_token) {
        try {
          const response = await apiClient.post('/auth/oauth-callback', {
            idToken: account.id_token,
            provider: 'google',
          })
          token.accessToken = response.data.data?.accessToken
          token.id = response.data.data?.user?.id
        } catch {
          // Keep token without backend accessToken if exchange fails
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken as string
      }
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})
