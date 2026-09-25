import { useId, useState, type ComponentType, type ReactNode } from 'react'
import { LoaderCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Titre, précédé de l'icône dans une pastille. */
  title: ReactNode
  /** Phrase sous le titre (reliée au dialog pour les lecteurs d'écran). */
  description?: ReactNode
  /** Description lue par les lecteurs d'écran seulement (`sr-only`), comme la plupart des dialogs Vue. */
  hideDescription?: boolean
  /** Icône de la pastille ; `Trash2` par défaut en variante destructive, aucune sinon ; `null` = aucune. */
  icon?: ComponentType<{ className?: string }> | null
  /** Résumé de l'élément concerné, avertissements… (entre l'en-tête et le champ de confirmation). */
  children?: ReactNode
  /** Libellé du bouton de confirmation (« Supprimer » en destructive, « Confirmer » sinon). */
  confirmLabel?: string
  /** Libellé pendant `isPending` (par défaut `confirmLabel`), ex. « Suppression... ». */
  pendingLabel?: string
  cancelLabel?: string
  /** `destructive` (défaut) : bouton et pastille rouges. */
  variant?: 'destructive' | 'default'
  /** Action en cours : boutons désactivés, spinner, fermeture bloquée. */
  isPending?: boolean
  /** Désactive la confirmation pour une raison propre à la page. */
  confirmDisabled?: boolean
  /**
   * Mot à taper pour activer la confirmation (ex. `'CONFIRMER'`, sensible à la casse) :
   * affiche « Pour confirmer, tapez … ci-dessous » et un champ « Tapez … » ; Entrée valide si conforme.
   */
  confirmText?: string
  onConfirm: () => void
  /** Classes du DialogContent (largeur `sm:max-w-md` par défaut). */
  className?: string
}

/**
 * Dialog de confirmation générique (suppression, action irréversible), calé sur les dialogs de
 * suppression du Vue (Users, Vehicules, StockItems, AbsenceDeleteModal…).
 *
 * Construit sur le `Dialog` shadcn avec `role="alertdialog"` plutôt que sur `AlertDialog` : Radix
 * AlertDialog interdit la fermeture au clic sur l'overlay, que le Vue permet et que CLAUDE.md
 * impose de conserver. Le dialog ne se ferme pas tout seul à la confirmation : la page le ferme
 * dans le `onSuccess` de sa mutation.
 *
 * @example
 * <ConfirmDialog
 *   open={dialogs.isOpen('delete')}
 *   onOpenChange={dialogs.onOpenChange}
 *   title="Supprimer le véhicule"
 *   description="Confirmer la suppression du véhicule"
 *   hideDescription
 *   confirmText="CONFIRMER"
 *   confirmLabel="Supprimer définitivement"
 *   pendingLabel="Suppression..."
 *   isPending={deleteMutation.isPending}
 *   onConfirm={() => deleteMutation.mutate(id, { onSuccess: dialogs.close })}
 * >
 *   <VehicleSummary vehicule={dialogs.item} />
 * </ConfirmDialog>
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  description,
  isPending = false,
  className,
  ...props
}: ConfirmDialogProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && isPending) return
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        role="alertdialog"
        className={cn('max-h-[90dvh] overflow-y-auto sm:max-w-md', className)}
      >
        {/* Contenu monté à chaque ouverture : le texte tapé repart de zéro. */}
        <ConfirmDialogBody
          description={description}
          isPending={isPending}
          onCancel={() => handleOpenChange(false)}
          {...props}
        />
      </DialogContent>
    </Dialog>
  )
}

type ConfirmDialogBodyProps = Omit<ConfirmDialogProps, 'open' | 'onOpenChange' | 'className'> & {
  onCancel: () => void
}

function ConfirmDialogBody({
  title,
  description,
  hideDescription = false,
  icon,
  children,
  variant = 'destructive',
  confirmLabel = variant === 'destructive' ? 'Supprimer' : 'Confirmer',
  pendingLabel,
  cancelLabel = 'Annuler',
  isPending = false,
  confirmDisabled = false,
  confirmText,
  onConfirm,
  onCancel,
}: ConfirmDialogBodyProps) {
  const inputId = useId()
  const [typed, setTyped] = useState('')
  const Icon = icon === undefined ? (variant === 'destructive' ? Trash2 : null) : icon
  const textMatches = !confirmText || typed === confirmText
  const canConfirm = textMatches && !confirmDisabled && !isPending

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {Icon && (
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full',
                variant === 'destructive'
                  ? 'bg-destructive/15 text-destructive'
                  : 'bg-primary/15 text-primary',
              )}
            >
              <Icon className="size-5" />
            </span>
          )}
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className={cn(hideDescription && 'sr-only')}>
            {description}
          </DialogDescription>
        )}
      </DialogHeader>

      {(children || confirmText) && (
        <div className="space-y-4">
          {children}
          {confirmText && (
            <div className="text-left">
              <label htmlFor={inputId} className="mb-2 block text-sm text-muted-foreground">
                Pour confirmer, tapez <strong className="text-foreground">{confirmText}</strong>{' '}
                ci-dessous :
              </label>
              <Input
                id={inputId}
                type="text"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    if (canConfirm) onConfirm()
                  }
                }}
                placeholder={`Tapez ${confirmText}`}
                autoComplete="off"
                disabled={isPending}
                className="text-center font-medium tracking-widest"
              />
            </div>
          )}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'destructive' ? 'destructive' : 'default'}
          disabled={!canConfirm}
          onClick={onConfirm}
        >
          {isPending && <LoaderCircle className="size-4 animate-spin" />}
          {isPending ? (pendingLabel ?? confirmLabel) : confirmLabel}
        </Button>
      </DialogFooter>
    </>
  )
}
