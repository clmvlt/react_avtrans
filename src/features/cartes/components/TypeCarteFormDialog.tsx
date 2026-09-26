import { LoaderCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTypeCarteQuery } from '../api/useTypeCarteQuery'
import { TypeCarteForm } from './TypeCarteForm'

type TypeCarteFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  isCreating: boolean
  /** Type à modifier (rechargé par GET /type-cartes/{uuid} à chaque ouverture, comme le Vue). */
  typeCarteUuid?: string
}

/** Dialog « Créer un type de carte » / « Modifier le type de carte ». */
export function TypeCarteFormDialog({
  open,
  onOpenChange,
  isCreating,
  typeCarteUuid,
}: TypeCarteFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isCreating ? 'Créer un type de carte' : 'Modifier le type de carte'}
          </DialogTitle>
          <DialogDescription>
            {isCreating
              ? 'Ajouter un nouveau type de carte'
              : 'Modifier les informations du type de carte'}
          </DialogDescription>
        </DialogHeader>
        <TypeCarteFormDialogBody
          key={isCreating ? 'new' : typeCarteUuid}
          isCreating={isCreating}
          typeCarteUuid={typeCarteUuid}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type TypeCarteFormDialogBodyProps = {
  isCreating: boolean
  typeCarteUuid?: string
  onClose: () => void
}

function TypeCarteFormDialogBody({
  isCreating,
  typeCarteUuid,
  onClose,
}: TypeCarteFormDialogBodyProps) {
  const typeCarteQuery = useTypeCarteQuery(typeCarteUuid, { enabled: !isCreating })

  if (!isCreating && typeCarteUuid && typeCarteQuery.isPending) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <LoaderCircle className="size-10 animate-spin text-primary" />
        <p className="text-lg text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  const loadedType = !isCreating && typeCarteQuery.data?.uuid ? typeCarteQuery.data : null
  const loadError = isCreating
    ? ''
    : typeCarteQuery.isError
      ? (typeCarteQuery.error instanceof Error && typeCarteQuery.error.message) ||
        'Erreur lors du chargement du type de carte'
      : typeCarteQuery.isSuccess && !loadedType
        ? 'Type de carte non trouvé'
        : ''

  return (
    <TypeCarteForm
      isCreating={isCreating}
      typeCarteUuid={typeCarteUuid}
      typeCarte={loadedType}
      loadError={loadError}
      onCancel={onClose}
      onSaved={onClose}
    />
  )
}
