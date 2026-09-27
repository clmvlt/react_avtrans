import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'
import logoUrl from '@/assets/favicon.png'
import { PageMeta } from '@/components/shared/PageMeta'
import { AndroidDownloadCard } from '@/features/app-versions/components/AndroidDownloadCard'
import { IosTestflightCard } from '@/features/app-versions/components/IosTestflightCard'
import { getDeviceType } from '@/features/app-versions/lib/deviceType'
import { cn } from '@/lib/utils'

/** /download (public, hors coquille) : téléchargement de l'application mobile. */
export default function AppVersionsPublicPage() {
  // Sur iPhone / iPad, la carte iOS passe en premier
  const showIosFirst = getDeviceType() === 'ios'

  return (
    <>
      <PageMeta title="Application mobile AVTRANS — Téléchargement" robots="noindex, follow" />

      <main className="min-h-svh bg-muted/40 px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto flex max-w-3xl flex-col gap-8">
          <div className="flex flex-col items-center text-center">
            <img src={logoUrl} alt="AVTRANS" className="mb-5 size-14 rounded-xl shadow-xs" />
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              AVTRANS Pointage
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Téléchargez l'application mobile</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AndroidDownloadCard className={cn(showIosFirst && 'order-1 md:order-2')} />
            <IosTestflightCard className={cn(showIosFirst && '-order-1')} />
          </div>

          <div className="text-center">
            <Link
              to="/"
              className="inline-flex min-h-9 items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <ArrowLeft className="size-3.5" />
              Retour au site
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
