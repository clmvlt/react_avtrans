import logoUrl from '@/assets/favicon.png'
import { PageMeta } from '@/components/shared/PageMeta'
import { AndroidDownloadCard } from '@/features/app-versions/components/AndroidDownloadCard'
import { IosTestflightCard } from '@/features/app-versions/components/IosTestflightCard'
import { getDeviceType } from '@/features/app-versions/lib/deviceType'
import { cn } from '@/lib/utils'

/** /download (public, sans navbar) : téléchargement de l'application mobile. */
export default function AppVersionsPublicPage() {
  // Sur iPhone / iPad, la carte iOS passe en premier
  const showIosFirst = getDeviceType() === 'ios'

  return (
    <>
      <PageMeta title="Application mobile AVTRANS — Téléchargement" robots="noindex, follow" />

      <div className="min-h-screen bg-linear-to-b from-primary/5 via-background to-background">
        <header className="border-b bg-card/80 backdrop-blur-sm">
          <div className="mx-auto max-w-3xl px-4 py-8 text-center sm:py-12">
            <div className="mx-auto mb-4 inline-flex size-18 items-center justify-center overflow-hidden rounded-2xl shadow-lg ring-2 ring-primary/20 sm:size-22">
              <img src={logoUrl} alt="Logo AVTRANS" className="size-full object-cover" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              AVTRANS Pointage
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              Téléchargez l'application mobile
            </p>
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <AndroidDownloadCard className={cn(showIosFirst && 'order-1 md:order-2')} />
            <IosTestflightCard className={cn(showIosFirst && '-order-1')} />
          </div>
        </main>
      </div>
    </>
  )
}
