import type { useRelaiDialogs } from '../../hooks/useRelaiDialogs'
import { RelaiDeleteDialog } from './RelaiDeleteDialog'
import { RelaiEndDialog } from './RelaiEndDialog'
import { RelaiFormDialog } from './RelaiFormDialog'

type RelaiDialogsProps = {
  vehiculeId: string
  state: ReturnType<typeof useRelaiDialogs>
}

/** Dialogs des relais d'un véhicule : déclaration / modification, fin, suppression (D9). */
export function RelaiDialogs({ vehiculeId, state }: RelaiDialogsProps) {
  const { dialogs, defaultImmat } = state

  return (
    <>
      <RelaiFormDialog
        open={dialogs.isOpen('form')}
        onOpenChange={dialogs.onOpenChange}
        vehiculeId={vehiculeId}
        relai={dialogs.type === 'form' ? dialogs.item : null}
        defaultImmat={defaultImmat}
      />
      <RelaiEndDialog
        open={dialogs.isOpen('end')}
        onOpenChange={dialogs.onOpenChange}
        vehiculeId={vehiculeId}
        relai={dialogs.type === 'end' ? dialogs.item : null}
      />
      <RelaiDeleteDialog
        open={dialogs.isOpen('delete')}
        onOpenChange={dialogs.onOpenChange}
        relai={dialogs.type === 'delete' ? dialogs.item : null}
      />
    </>
  )
}
