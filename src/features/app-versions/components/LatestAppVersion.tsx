import { Calendar, Download, FileText, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppVersionDTO } from '@/models'
import { appVersionsService } from '@/services'
import { formatDownloadCount, formatFileSize, formatLongDate } from '../lib/format'

type LatestAppVersionProps = {
  version: AppVersionDTO
}

/**
 * Dernière version Android de /download : informations, nouveautés, bouton de téléchargement.
 * Le bouton télécharge `latest/download`, choisi par le serveur, alors que la carte affiche la
 * version au plus grand build calculée côté client : les deux peuvent diverger, comme dans le Vue.
 */
export function LatestAppVersion({ version }: LatestAppVersionProps) {
  return (
    <>
      <div className="flex-1">
        <div className="mb-4 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">{version.versionName}</span>
          <span className="text-xs text-muted-foreground">Build {version.versionCode}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            {formatFileSize(version.fileSize)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {formatLongDate(version.createdAt)}
          </span>
          <span className="flex items-center gap-1.5">
            <Download className="size-3.5" />
            {formatDownloadCount(version.downloadCount)}
          </span>
        </div>

        {version.changelog && (
          <div className="mb-5 rounded-lg bg-muted/60 p-3.5">
            <h3 className="mb-1.5 flex items-center gap-2 text-xs font-semibold text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              Nouveautés
            </h3>
            <p className="text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
              {version.changelog}
            </p>
          </div>
        )}
      </div>

      <Button asChild size="lg" className="w-full gap-2">
        <a href={appVersionsService.getLatestDownloadUrl()} download>
          <Download className="size-4" />
          Télécharger l'APK
        </a>
      </Button>
    </>
  )
}
