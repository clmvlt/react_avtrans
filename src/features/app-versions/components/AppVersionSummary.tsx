import { cn } from '@/lib/utils'
import type { AppVersionDTO } from '@/models'
import { formatDateTime, formatFileSize } from '../lib/format'

type AppVersionSummaryProps = {
  version: AppVersionDTO
}

/** Informations en lecture seule en tête du dialog de modification. */
export function AppVersionSummary({ version }: AppVersionSummaryProps) {
  const items = [
    { label: 'Version', value: `${version.versionName} (Build ${version.versionCode})` },
    { label: 'Fichier', value: version.originalFileName, className: 'break-words' },
    { label: 'Taille', value: formatFileSize(version.fileSize || 0) },
    { label: 'Téléchargements', value: version.downloadCount || 0 },
    { label: 'Créé le', value: formatDateTime(version.createdAt) },
    { label: 'Créé par', value: version.createdByName || '-' },
  ]

  return (
    <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/50 p-4">
      {items.map((item) => (
        <div key={item.label} className="space-y-1">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className={cn('text-sm font-medium text-foreground', item.className)}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}
