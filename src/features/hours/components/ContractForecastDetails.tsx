import type { ReactNode } from 'react'
import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatJours,
  formatPercentage,
  getDifferenceClass,
  getPercentageClass,
  type ContractRow,
} from '../lib/contractFormat'

type ContractForecastDetailsProps = {
  row: ContractRow
  /** Jours ouvrés restants du mois sans les absences, pour chiffrer les jours d'absence déduits. */
  joursOuvresRestantsMois: number | null
  className?: string
}

function DetailRow({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4', className)}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium whitespace-nowrap text-foreground">{children}</dd>
    </div>
  )
}

const jours = (value: number) => `${formatJours(value)} j`

/**
 * Bouton « ? » de la réalisation prévue (D10) : au clic, le détail du calcul en quelques lignes
 * (déjà fait, jours disponibles, absences déduites, heures encore prévues, total, contrat, écart).
 */
export function ContractForecastDetails({
  row,
  joursOuvresRestantsMois,
  className,
}: ContractForecastDetailsProps) {
  const disponibles = row.joursOuvresRestants ?? 0
  const absents =
    joursOuvresRestantsMois != null ? Math.max(0, joursOuvresRestantsMois - disponibles) : 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn('text-muted-foreground hover:text-foreground', className)}
          aria-label={`Détail de la réalisation prévue${row.fullName ? ` de ${row.fullName}` : ''}`}
        >
          <CircleHelp />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-72 text-sm">
        <PopoverHeader>
          <PopoverTitle>Réalisation prévue en fin de mois</PopoverTitle>
          {row.fullName && <PopoverDescription>{row.fullName}</PopoverDescription>}
        </PopoverHeader>

        <dl className="mt-3 space-y-1.5">
          <DetailRow label="Déjà fait ce mois">{formatContractHours(row.heuresTotal)}</DetailRow>
          <DetailRow label="Jours encore disponibles">{jours(disponibles)}</DetailRow>
          {absents > 0 && (
            <DetailRow label="Vacances et absences déduites">{jours(absents)}</DetailRow>
          )}
          <DetailRow label="Heures par jour (contrat)">
            {formatContractHours(row.heuresParJourContrat)}
          </DetailRow>
          <DetailRow label="Heures encore prévues">
            + {formatContractHours(row.heuresRestantesPrevues)}
          </DetailRow>
        </dl>

        <Separator className="my-3" />

        <dl className="space-y-1.5">
          <DetailRow label="Total prévu" className="font-semibold">
            {formatContractHours(row.heuresPrevisionnelles)}
          </DetailRow>
          <DetailRow label="Contrat">{formatContractHours(row.heureContrat)}</DetailRow>
          <DetailRow label="Écart prévu">
            <span className={getDifferenceClass(row.differencePrevisionnelle)}>
              {formatDifference(row.differencePrevisionnelle)}
            </span>
          </DetailRow>
          <DetailRow label="Réalisation prévue">
            <span className={cn('font-bold', getPercentageClass(row.pourcentagePrevisionnel))}>
              {formatPercentage(row.pourcentagePrevisionnel)}
            </span>
          </DetailRow>
        </dl>

        <p className="mt-3 text-xs text-muted-foreground">
          Jours du lundi au vendredi jusqu&apos;à la fin du mois, aujourd&apos;hui compris, sans les
          jours fériés. Les heures déjà pointées aujourd&apos;hui sont déduites.
        </p>
      </PopoverContent>
    </Popover>
  )
}
