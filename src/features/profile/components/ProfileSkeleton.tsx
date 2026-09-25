import { Skeleton } from '@/components/ui/skeleton'

/** Chargement de /profile : bouton « Retour » et les trois sections. */
export function ProfileSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Chargement...">
      <Skeleton className="h-8 w-24" />
      {[0, 1, 2].map((section) => (
        <div key={section} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-8 w-24" />
          </div>
          {section === 0 && <Skeleton className="mb-4 h-28 w-full rounded-md" />}
          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Skeleton className="h-16 rounded-md" />
            <Skeleton className="h-16 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  )
}
