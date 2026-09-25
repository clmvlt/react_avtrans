import { ChevronRight, CircleCheck, CircleX, Hourglass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AcompteDTO } from '@/models'
import { cn } from '@/lib/utils'
import {
  formatMontant,
  getAcompteStatusClasses,
  getAcompteStatusLabel,
} from '@/utils/acompteFormatters'

type MyAcompteCardProps = {
  acompte: AcompteDTO
  onOpen: (acompte: AcompteDTO) => void
  onCancel: (acompte: AcompteDTO) => void
}

const parseDate = (value?: string | Date): Date | null => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

/** Teinte de la tuile de date selon le statut. */
const TILE_CLASSES: Record<string, string> = {
  APPROVED: 'bg-green-500/10 text-green-700 dark:text-green-400',
  REJECTED: 'bg-destructive/10 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
}

/**
 * Carte d'une demande d'acompte (port de `MyAcompteCard.vue`) : tuile de la date de demande,
 * montant, statut, raison, ligne de paiement (si approuvé), motif du refus ; pied « Annuler »
 * pour une demande en attente.
 */
export function MyAcompteCard({ acompte, onOpen, onCancel }: MyAcompteCardProps) {
  const createdAt = parseDate(acompte.createdAt)
  const montantLabel = formatMontant(acompte.montant)
  const statusLabel = getAcompteStatusLabel(acompte.status)

  let paymentLabel = ''
  if (acompte.status === 'APPROVED') {
    const paid = parseDate(acompte.paidDate)
    paymentLabel = acompte.isPaid
      ? paid
        ? `Payé le ${paid.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
        : 'Payé'
      : 'En attente de paiement'
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors hover:border-primary/40">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left transition-colors active:bg-accent/40 sm:p-4"
        aria-label={`Détails : ${montantLabel}, ${statusLabel}`}
        onClick={() => onOpen(acompte)}
      >
        <div
          className={cn(
            'flex w-14 shrink-0 flex-col items-center justify-center self-stretch rounded-lg py-1.5',
            TILE_CLASSES[acompte.status ?? ''] ??
              'bg-amber-500/10 text-amber-700 dark:text-amber-400',
          )}
        >
          <span className="text-xl leading-none font-bold tabular-nums">
            {createdAt ? String(createdAt.getDate()) : '--'}
          </span>
          <span className="mt-1 text-[11px] leading-none font-semibold uppercase">
            {createdAt
              ? createdAt.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
              : ''}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate text-lg font-bold text-foreground tabular-nums">
              {montantLabel}
            </p>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                getAcompteStatusClasses(acompte.status),
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">
            {acompte.raison || 'Sans motif'}
          </p>
          {paymentLabel && (
            <p
              className={cn(
                'mt-1 flex items-center gap-1 text-xs',
                acompte.isPaid
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-amber-700 dark:text-amber-400',
              )}
            >
              {acompte.isPaid ? (
                <CircleCheck className="size-3.5" />
              ) : (
                <Hourglass className="size-3.5" />
              )}
              {paymentLabel}
            </p>
          )}
          {acompte.status === 'REJECTED' && acompte.rejectionReason && (
            <p className="mt-1 line-clamp-1 text-xs text-destructive">
              Refus : {acompte.rejectionReason}
            </p>
          )}
        </div>

        <ChevronRight className="size-4 shrink-0 text-muted-foreground/60" />
      </button>

      {acompte.status === 'PENDING' && (
        <div className="flex items-center justify-between border-t bg-muted/30 px-3 py-1.5 sm:px-4">
          <span className="text-xs text-muted-foreground">En attente de validation</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onCancel(acompte)}
          >
            <CircleX className="size-4" />
            Annuler
          </Button>
        </div>
      )}
    </article>
  )
}
