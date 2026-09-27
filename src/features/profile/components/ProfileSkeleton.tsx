import { Skeleton } from '@/components/ui/skeleton'

/** Chargement de /profile : les trois sections (l'en-tête de page reste affiché). */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement...">
      {[0, 1, 2].map((section) => (
        <div key={section} className="rounded-xl border bg-card p-4 sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4 border-b pb-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-5 w-40 sm:w-56" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
          {section === 0 && <Skeleton className="mb-4 h-28 w-full rounded-lg" />}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
