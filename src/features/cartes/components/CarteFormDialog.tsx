import { LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useCarteQuery } from '../api/useCarteQuery'
import { CarteForm } from './CarteForm'

type CarteFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCreating: boolean
  /** Carte à modifier (rechargée par GET /cartes/{uuid} à chaque ouverture). */
  carteUuid?: string
}

/** Dialog « Créer une carte » / « Modifier la carte ». */
export function CarteFormDialog({
  open,
  onOpenChange,
  isCreating,
  carteUuid,
}: CarteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCreating ? 'Créer une carte' : 'Modifier la carte'}</DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Ajouter une nouvelle carte au système'
              : 'Modifier les informations de la carte'}
          </DialogDescription>
        </DialogHeader>
        {/* Contenu monté à chaque ouverture : chargement et formulaire repartent de zéro */}
        <CarteFormDialogBody
          key={isCreating ? 'new' : carteUuid}
          isCreating={isCreating}
          carteUuid={carteUuid}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type CarteFormDialogBodyProps = {
  isCreating: boolean
  carteUuid?: string
  onClose: () => void
}

function CarteFormDialogBody({ isCreating, carteUuid, onClose }: CarteFormDialogBodyProps) {
  const carteQuery = useCarteQuery(carteUuid, { enabled: !isCreating })

  if (!isCreating && carteUuid && carteQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const loadedCarte = !isCreating && carteQuery.data?.uuid ? carteQuery.data : null
  const loadError = isCreating
    ? ''
    : carteQuery.isError
      ? (carteQuery.error instanceof Error && carteQuery.error.message) ||
        'Erreur lors du chargement de la carte'
      : carteQuery.isSuccess && !loadedCarte
        ? 'Carte non trouvée'
        : ''

  return (
    <CarteForm
      isCreating={isCreating}
      carteUuid={carteUuid}
      carte={loadedCarte}
      loadError={loadError}
      onCancel={onClose}
      onSaved={onClose}
    />
  )
}
