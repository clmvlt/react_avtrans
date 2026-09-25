/** Clés TanStack Query (requêtes et mutations) du domaine auth. */
export const authKeys = {
  all: ['auth'] as const,
  verifyEmail: (token: string) => [...authKeys.all, 'verify-email', token] as const,
  login: () => [...authKeys.all, 'login'] as const,
  google: () => [...authKeys.all, 'google'] as const,
  register: () => [...authKeys.all, 'register'] as const,
  googleRegister: () => [...authKeys.all, 'google-register'] as const,
  passwordResetRequest: () => [...authKeys.all, 'password-reset', 'request'] as const,
  passwordResetConfirm: () => [...authKeys.all, 'password-reset', 'confirm'] as const,
}
