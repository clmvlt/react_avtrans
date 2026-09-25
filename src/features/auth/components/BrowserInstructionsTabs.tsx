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
 * d'accueil. Le navigateur détecté est présélectionné, Chrome Android sinon.
 */
export function BrowserInstructionsTabs() {
  const [selectedBrowser, setSelectedBrowser] = useState<BrowserType>(() => {
    const detected = detectBrowser()
    return detected !== 'unknown' ? detected : 'chrome-android'
  })

  return (
    <>
      <div className="mb-4">
        <p className="mb-3 text-sm font-medium text-muted-foreground">
          Instructions pour votre navigateur
        </p>
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
                <TabsTrigger
                  key={browser}
                  value={browser}
                  aria-label={name}
                  className="flex items-center gap-2"
                >
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">{name}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      </div>

      <ol className="mb-6 space-y-3">
        <li className="flex items-start gap-3 rounded-md border border-primary bg-primary/5 p-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            1
          </span>
          <span className="pt-0.5 font-medium text-foreground">
            Cliquez sur le bouton ci-dessous pour aller sur la page Pointage
          </span>
        </li>
        {getInstructions(selectedBrowser).map((step, index) => (
          <li key={step} className="flex items-start gap-3 rounded-md bg-muted p-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {index + 2}
            </span>
            <span className="pt-0.5 text-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </>
  )
}
