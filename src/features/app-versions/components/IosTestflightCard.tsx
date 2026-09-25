import { ExternalLink, Plane } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { IOS_STEPS, TESTFLIGHT_JOIN_URL } from '../data/iosSteps'
import { AppleIcon } from './AppleIcon'
import { PlatformCard } from './PlatformCard'

type IosTestflightCardProps = {
  className?: string
}

/** Carte iOS de /download : étapes TestFlight et lien d'invitation. */
export function IosTestflightCard({ className }: IosTestflightCardProps) {
  return (
    <PlatformCard
      icon={<AppleIcon className="size-6" />}
      iconClassName="bg-foreground text-background"
      headerClassName="bg-linear-to-r from-foreground/5 to-transparent"
      title="iOS"
      subtitle="Via TestFlight (iPhone & iPad)"
      note="TestFlight doit être installé depuis l'App Store."
      className={className}
    >
      <Badge
        variant="outline"
        className="mb-5 w-fit border-violet-500/30 text-violet-600 dark:text-violet-400"
      >
        <Plane className="size-3" />
        Programme TestFlight
      </Badge>

      <ol className="mb-5 space-y-3">
        {IOS_STEPS.map((step, index) => (
          <li key={step.title} className="flex items-start gap-3">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {index + 1}
            </span>
            <div className="flex-1 text-sm leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">{step.title}</span>
              {step.description}
              {step.link && (
                <a
                  href={step.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {step.linkLabel}
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-auto">
        <Button asChild size="lg" className="w-full gap-2">
          <a href={TESTFLIGHT_JOIN_URL} target="_blank" rel="noopener noreferrer">
            <AppleIcon className="size-4" />
            Rejoindre sur TestFlight
          </a>
        </Button>
      </div>
    </PlatformCard>
  )
}
