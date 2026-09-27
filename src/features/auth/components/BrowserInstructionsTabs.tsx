import { useState } from 'react'
import { Compass, Flame, Globe, Monitor, Smartphone, type LucideIcon } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  detectBrowser,
  getAllBrowserTypes,
  getBrowserName,
  getInstructions,
  type BrowserType,
} from '../lib/browserDetection'

const BROWSER_ICONS: Record<BrowserType, LucideIcon> = {
  'chrome-android': Globe,
  'chrome-ios': Globe,
  safari: Compass,
  firefox: Flame,
  edge: Monitor,
  samsung: Smartphone,
  unknown: Globe,
}

const AVAILABLE_BROWSERS = getAllBrowserTypes().filter((browser) => browser !== 'unknown')

const isBrowserType = (value: string): value is BrowserType =>
  (AVAILABLE_BROWSERS as string[]).includes(value)

/**
 * Sélecteur de navigateur (onglets sans contenu, comme le Vue) et étapes d'ajout à l'écran
 * d'accueil. Le navigateur détecté est présélectionné, Chrome Android sinon. Les noms restent
 * visibles sur téléphone : les deux Chrome ont la même icône.
 */
export function BrowserInstructionsTabs() {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>(() => {
    const detected = detectBrowser()
    return detected !== 'unknown' ? detected : 'chrome-android'
  })

  return (
    <>
      <div className="mb-4">
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Instructions pour votre navigateur
        </h2>
        <Tabs
          value={selectedBrowser}
          onValueChange={(value) => {
            if (isBrowserType(value)) setSelectedBrowser(value)
          }}
        >
          <TabsList className="flex h-auto w-full flex-wrap gap-1 group-data-[orientation=horizontal]/tabs:h-auto">
            {AVAILABLE_BROWSERS.map((browser) => {
              const Icon = BROWSER_ICONS[browser]
              const name = getBrowserName(browser)
              return (
                <TabsTrigger key={browser} value={browser} className="h-8">
                  <Icon className="size-4" />
                  {name}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      <ol className="mb-6 space-y-3">
        <li className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/5 p-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          <span className="pt-0.5 text-sm font-medium text-foreground">
            Cliquez sur le bouton ci-dessous pour aller sur la page Pointage
          </span>
        </li>
        {getInstructions(selectedBrowser).map((step, index) => (
          <li key={step} className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 2}
            </span>
            <span className="pt-0.5 text-sm text-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </>
  )
}
