import type { ColumnDef } from '@tanstack/react-table'
import { Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AppVersionDTO } from '@/models'
import { formatFileSize, formatShortDate, truncateText } from '../lib/format'
import { AppVersionRowActions } from './AppVersionRowActions'

type AppVersionColumnsOptions = {
  onEdit: (version: AppVersionDTO) => void
  onDelete: (version: AppVersionDTO) => void
}

/** Colonne masquée sous un point de rupture (en-tête et cellules). */
const responsive = (className: string) => ({ headerClassName: className, cellClassName: className })

/**
 * Colonnes de la liste admin des versions, reprises du tableau du Vue : pas de tri par colonne
 * (ordre fixe par build décroissant), colonnes secondaires masquées sur petit écran.
 */
export function getAppVersionColumns({
  onEdit,
  onDelete,
}: AppVersionColumnsOptions): ColumnDef<AppVersionDTO>[] {
  return [
    {
      id: 'version',
      header: ({ table }) => `Version (${table.getRowModel().rows.length})`,
      cell: ({ row: { original: version } }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground">{version.versionName}</span>
          <span className="text-xs text-muted-foreground">Build {version.versionCode}</span>
          <span className="text-xs text-muted-foreground md:hidden">
            {formatFileSize(version.fileSize)}
          </span>
          <span className="text-xs text-muted-foreground sm:hidden">
            {formatShortDate(version.createdAt)}
          </span>
        </div>
      ),
    },
    {
      id: 'file',
      header: 'Fichier',
      meta: responsive('hidden md:table-cell'),
      cell: ({ row: { original: version } }) => (
        <div className="flex flex-col gap-0.5">
          <span className="max-w-[200px] truncate text-sm text-foreground">
            {version.originalFileName}
          </span>
          <span className="text-xs text-muted-foreground">{formatFileSize(version.fileSize)}</span>
        </div>
      ),
    },
    {
      id: 'notes',
      header: 'Notes',
      meta: responsive('hidden lg:table-cell'),
      cell: ({ row: { original: version } }) =>
        version.changelog ? (
          <span className="text-sm text-muted-foreground">
            {truncateText(version.changelog, 50)}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground/50">-</span>
        ),
    },
    {
      id: 'status',
      header: 'Statut',
      cell: ({ row: { original: version } }) => (
        <Badge
          variant={version.isActive ? 'outline' : 'destructive'}
          className={cn(version.isActive && 'border-success/50 text-success')}
        >
          {version.isActive ? 'Actif' : 'Inactif'}
        </Badge>
      ),
    },
    {
      id: 'downloads',
      header: 'Téléch.',
      meta: responsive('hidden sm:table-cell'),
      cell: ({ row: { original: version } }) => (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Download className="size-3.5" />
          {version.downloadCount}
        </div>
      ),
    },
    {
      id: 'date',
      header: 'Date',
      meta: responsive('hidden sm:table-cell'),
      cell: ({ row: { original: version } }) => (
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {formatShortDate(version.createdAt)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: version } }) => (
        <AppVersionRowActions version={version} onEdit={onEdit} onDelete={onDelete} />
      ),
    },
  ]
}
