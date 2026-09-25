import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormErrorAlert } from '@/features/absences/components/FormErrorAlert'
import { errorMessage } from '@/features/absences/lib/errorMessage'
import { useCreateAcompteRequestMutation } from '../../api/useCreateAcompteRequestMutation'
import { myAcompteRequestSchema, type MyAcompteRequestValues } from '../../schemas/acompte'

type MyAcompteRequestDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Après l'envoi (la page recharge la première page). */
  onSaved: () => void
}

/** Nouvelle demande d'acompte de l'employé (port de `MyAcompteEditModal.vue`). */
export function MyAcompteRequestDialog({
  open,
  onOpenChange,
  onSaved,
}: MyAcompteRequestDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle demande d&apos;acompte</DialogTitle>
          <DialogDescription>
            Envoyer une demande d&apos;acompte à votre responsable
          </DialogDescription>
        </DialogHeader>
        {/* Monté à chaque ouverture : formulaire et erreurs repartent de zéro. */}
        <MyAcompteRequestBody onClose={() => onOpenChange(false)} onSaved={onSaved} />
      </DialogContent>
    </Dialog>
  )
}

type MyAcompteRequestBodyProps = {
  onClose: () => void
  onSaved: () => void
}

function MyAcompteRequestBody({ onClose, onSaved }: MyAcompteRequestBodyProps) {
  const id = useId()
  const createRequest = useCreateAcompteRequestMutation()
  const saving = createRequest.isPending

  const form = useForm<MyAcompteRequestValues>({
    resolver: zodResolver(myAcompteRequestSchema),
    // Montant initial « 0 », affiché tel quel comme le Vue
    defaultValues: { montant: '0', raison: '' },
  })

  const onSubmit = (values: MyAcompteRequestValues) =>
    createRequest.mutate(
      { montant: Number(values.montant), raison: values.raison || undefined },
      {
        onSuccess: () => {
          onSaved()
          toast.success('Succès', { description: "Demande d'acompte envoyée avec succès" })
          onClose()
        },
        onError: (err) =>
          toast.error('Erreur', {
            description: errorMessage(err, "Erreur lors de l'envoi de la demande"),
          }),
      },
    )

  return (
    <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {createRequest.isError && (
        <FormErrorAlert
          message={errorMessage(createRequest.error, "Erreur lors de l'envoi de la demande")}
        />
      )}

      <Controller
        name="montant"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="gap-2">
            <FieldLabel htmlFor={`${id}-montant`}>Montant (€) *</FieldLabel>
            <Input
              {...field}
              id={`${id}-montant`}
              type="number"
              min="1"
              step="0.01"
              placeholder="500"
              disabled={saving}
              aria-invalid={fieldState.invalid}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name="raison"
        control={form.control}
        render={({ field }) => (
          <Field className="gap-2">
            <FieldLabel htmlFor={`${id}-raison`}>Raison</FieldLabel>
            <Textarea
              {...field}
              id={`${id}-raison`}
              placeholder="Motif de la demande (optionnel)..."
              rows={3}
              disabled={saving}
              className="min-h-[80px]"
            />
          </Field>
        )}
      />

      <DialogFooter>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoaderCircle className="size-4 animate-spin" />}
          Envoyer la demande
        </Button>
      </DialogFooter>
    </form>
  )
}
