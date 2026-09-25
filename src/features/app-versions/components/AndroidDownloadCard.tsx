import { PackageOpen } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Skeleton } from '@/components/ui/skeleton'
import { useActiveAppVersionsQuery } from '../api/useActiveAppVersionsQuery'
import { AndroidIcon } from './AndroidIcon'
import { AppVersionHistory } from './AppVersionHistory'
import { LatestAppVersion } from './LatestAppVersion'
import { PlatformCard } from './PlatformCard'

type AndroidDownloadCardProps = {
  className?: string
}

/** Carte Android de /download : dernière version active et versions précédentes. */
export function AndroidDownloadCard({ className }: AndroidDownloadCardProps) {
  const versionsQuery = useActiveAppVersionsQuery()

  return (
    <PlatformCard
      icon={<AndroidIcon className="size-6" />}
      iconClassName="bg-[#3ddc84] text-white"
      headerClassName="bg-linear-to-r from-[#3ddc84]/10 to-transparent"
      title="Android"
      subtitle="Téléchargement direct APK"
      note="Autorisez l'installation depuis des sources inconnues si nécessaire."
      className={className}
    >
      {versionsQuery.isPending ? (
        <div
          className="flex flex-1 flex-col gap-4"
          aria-busy="true"
          aria-label="Chargement des versions…"
        >
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="mt-auto h-10 w-full" />
        </div>
      ) : versionsQuery.isError ? (
        <ErrorState
          error={versionsQuery.error}
          onRetry={() => void versionsQuery.refetch()}
          isRetrying={versionsQuery.isRefetching}
        />
      ) : versionsQuery.data.latest ? (
        <>
          <LatestAppVersion version={versionsQuery.data.latest} />
          {versionsQuery.data.older.length > 0 && (
            <AppVersionHistory versions={versionsQuery.data.older} />
          )}
        </>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-10 text-muted-foreground">
          <PackageOpen className="mb-3 size-10 opacity-40" />
          <p className="text-sm">Aucune version disponible</p>
        </div>
      )}
    </PlatformCard>
  )
}
