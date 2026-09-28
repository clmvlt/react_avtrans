import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, LoaderCircle, Repeat } from 'lucide-react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { InputField } from '@/components/shared/InputField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { todayLocalISO } from '@/lib/dates'
import type { VehiculeRelaiDTO } from '@/models'
import { useSaveRelaiMutation } from '../../api/useSaveRelaiMutation'
import { getErrorMessage } from '../../lib/errors'
import { RELAI_MOTIFS } from '../../lib/relais'
import {
  relaiFormSchema,
  relaiToFormValues,
  toRelaiPayload,
  type RelaiFormValues,
} from '../../schemas/relai'
import { FormErrorBanner } from '../FormErrorBanner'
import { FormSectionSeparator } from '../forms/FormSectionSeparator'

type RelaiFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vehiculeId: string
  /** Relais modifié ; `null` = déclaration. */
  relai: VehiculeRelaiDTO | null
  /** Plaque préremplie à la déclaration (ancienne plaque relais saisie à la main). */
  defaultImmat?: string
}

/** Déclaration ou modification d'un véhicule relais (D9). */
export function RelaiFormDialog({
  open,
  onOpenChange,
  vehiculeId,
  relai,
  defaultImmat,
}: RelaiFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <RelaiForm
          vehiculeId={vehiculeId}
          relai={relai}
          defaultImmat={defaultImmat}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

type RelaiFormProps = {
  vehiculeId: string
  relai: VehiculeRelaiDTO | null
  defaultImmat?: string
  onClose: () => void
}

function RelaiForm({ vehiculeId, relai, defaultImmat, onClose }: RelaiFormProps) {
  const commentaireId = useId()
  const saveRelai = useSaveRelaiMutation(vehiculeId)
  const form = useForm<RelaiFormValues>({
    resolver: zodResolver(relaiFormSchema),
    defaultValues: relaiToFormValues(relai, { immat: defaultImmat, dateDebut: todayLocalISO() }),
    mode: 'onTouched',
  })
  const dateDebut = useWatch({ control: form.control, name: 'dateDebut' })
  const isEditMode = !!relai
  const saving = saveRelai.isPending

  const onSubmit = (values: RelaiFormValues) => {
    saveRelai.mutate(
      { relaiId: relai?.id, relai: toRelaiPayload(values) },
      {
        onSuccess: () => {
          toast.success(isEditMode ? 'Relais modifié' : 'Relais déclaré')
          onClose()
        },
      },
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Repeat className="size-5" />
          </div>
          {isEditMode ? 'Modifier le relais' : 'Déclarer un véhicule relais'}
        </DialogTitle>
        <DialogDescription>
          Pendant le relais, les kilométrages saisis sur ce véhicule sont enregistrés pour le
          véhicule relais.
        </DialogDescription>
      </DialogHeader>

      {saveRelai.isError && (
        <FormErrorBanner>
          {getErrorMessage(saveRelai.error, 'Erreur lors de la sauvegarde')}
        </FormErrorBanner>
      )}

      <form noValidate onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="immat"
          control={form.control}
          render={({ field, fieldState }) => (
            <InputField
              {...field}
              onChange={(event) => field.onChange(event.target.value.toUpperCase())}
              label="Immatriculation du véhicule relais"
              required
              placeholder="AB-123-CD"
              maxLength={20}
              autoComplete="off"
              className="[&_input]:font-semibold [&_input]:tracking-wide [&_input]:uppercase"
              disabled={saving}
              error={fieldState.error?.message}
            />
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="marque"
            control={form.control}
            render={({ field }) => (
              <InputField {...field} label="Marque" placeholder="Renault" disabled={saving} />
            )}
          />
          <Controller
            name="modele"
            control={form.control}
            render={({ field }) => (
              <InputField {...field} label="Modèle" placeholder="Master" disabled={saving} />
            )}
          />
        </div>

        <FormSectionSeparator>Période</FormSectionSeparator>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="dateDebut"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="date"
                label="Début"
                required
                disabled={saving}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="dateFin"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="date"
                label="Fin"
                hint="Vide tant que le véhicule n'est pas revenu"
                min={dateDebut || undefined}
                disabled={saving}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <FormSectionSeparator>Kilométrage du relais</FormSectionSeparator>

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="kmDebut"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="number"
                inputMode="numeric"
                min={0}
                label="Km au départ"
                placeholder="45000"
                disabled={saving}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            name="kmFin"
            control={form.control}
            render={({ field, fieldState }) => (
              <InputField
                {...field}
                type="number"
                inputMode="numeric"
                min={0}
                label="Km au retour"
                placeholder="45850"
                disabled={saving}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <FormSectionSeparator>Informations</FormSectionSeparator>

        <Controller
          name="motif"
          control={form.control}
          render={({ field, fieldState }) => (
            <div className="space-y-2">
              <InputField
                {...field}
                label="Motif"
                placeholder="Garage, panne, sinistre..."
                maxLength={100}
                disabled={saving}
                error={fieldState.error?.message}
              />
              <div className="flex flex-wrap gap-1.5" aria-label="Motifs fréquents">
                {RELAI_MOTIFS.map((motif) => (
                  <Button
                    key={motif}
                    type="button"
                    variant={field.value === motif ? 'secondary' : 'outline'}
                    size="xs"
                    className="rounded-full"
                    disabled={saving}
                    onClick={() => field.onChange(motif)}
                  >
                    {motif}
                  </Button>
                ))}
              </div>
            </div>
          )}
        />

        <Controller
          name="commentaire"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-2">
              <FieldLabel htmlFor={commentaireId} className="text-sm font-medium">
                Commentaire
              </FieldLabel>
              <Textarea
                {...field}
                id={commentaireId}
                rows={3}
                placeholder="Loueur, n° de contrat, garage..."
                disabled={saving}
                className="field-sizing-fixed bg-background dark:bg-background"
              />
            </Field>
          )}
        />

        <DialogFooter>
          <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            {isEditMode ? 'Enregistrer' : 'Déclarer le relais'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}
