/** Clés TanStack Query des versions de l'application mobile (APK). */
export const appVersionKeys = {
  all: ['app-versions'] as const,
  /** Toutes les versions, actives ou non (GET /app-versions/admin, page /app-versions) */
  admin: () => [...appVersionKeys.all, 'admin'] as const,
  /** Versions actives (GET /app-versions, page publique /download) */
  active: () => [...appVersionKeys.all, 'active'] as const,
  /** Une version (GET /app-versions/{id}, dialog de modification) */
  detail: (id: string) => [...appVersionKeys.all, 'detail', id] as const,
  create: () => [...appVersionKeys.all, 'create'] as const,
  update: () => [...appVersionKeys.all, 'update'] as const,
  delete: () => [...appVersionKeys.all, 'delete'] as const,
}
