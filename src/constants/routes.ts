export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  SCRIBE: '/scribe',
  SCRIBE_RESULT: (id: string) => `/scribe/${id}`,
} as const
