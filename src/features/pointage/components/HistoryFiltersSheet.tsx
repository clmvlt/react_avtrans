import { useId } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import {
  HISTORY_TYPE_OPTIONS,
  historyFiltersSchema,
  type HistoryFilters,
} from '../schemas/historyFilters'

type HistoryFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Filtres appliqués : valeurs du formulaire à chaque ouverture */
  value: HistoryFilters
  onApply: (filters: HistoryFilters) => void
  onReset: () => void
}

const labelClassName = 'text-sm font-medium text-muted-foreground'

/** Filtres de l'historique : panneau en bas sous 640 px, latéral au-dessus (comme le Vue). */
export function HistoryFiltersSheet({
  open,
  onOpenChange,
  value,
  onApply,
  onReset,
}: HistoryFiltersSheetProps) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const formId = useId()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? 'bottom' : 'right'}
        className={cn('gap-0', isMobile && 'rounded-t-2xl pb-[env(safe-area-inset-bottom)]')}
      >
        <SheetHeader>
          <SheetTitle>Filtrer l&apos;historique</SheetTitle>
          <SheetDescription>Limitez l&apos;historique à une période ou à un type.</SheetDescription>
        </SheetHeader>

        <HistoryFiltersForm id={formId} defaultValues={value} onSubmit={onApply} />

        <SheetFooter className="flex-row gap-2 sm:justify-end">
          <Button type="button" variant="ghost" className="flex-1 sm:flex-none" onClick={onReset}>
            Réinitialiser
          </Button>
          <Button type="submit" form={formId} className="flex-1 sm:flex-none">
            Appliquer
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

type HistoryFiltersFormProps = {
  id: string
  defaultValues: HistoryFilters
  onSubmit: (filters: HistoryFilters) => void
}

/** Monté à chaque ouverture du Sheet : repart des filtres appliqués. */
function HistoryFiltersForm({ id, defaultValues, onSubmit }: HistoryFiltersFormProps) {
  const form = useForm<HistoryFilters>({
    resolver: zodResolver(historyFiltersSchema),
    defaultValues,
  })

  return (
    <form
      id={id}
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-4 px-4"
    >
      <div className="grid gap-3">
        <Controller
          name="startDate"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel htmlFor={`${id}-start`} className={labelClassName}>
                Du
              </FieldLabel>
              <Input {...field} id={`${id}-start`} type="date" />
            </Field>
          )}
        />
        <Controller
          name="endDate"
          control={form.control}
          render={({ field }) => (
            <Field className="gap-1.5">
              <FieldLabel htmlFor={`${id}-end`} className={labelClassName}>
                Au
              </FieldLabel>
              <Input {...field} id={`${id}-end`} type="date" />
            </Field>
          )}
        />
      </div>
      <Controller
        name="type"
        control={form.control}
        render={({ field }) => (
          <Combobox
            ref={field.ref}
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            label="Type"
            options={HISTORY_TYPE_OPTIONS}
            searchable={false}
          />
        )}
      />
    </form>
  )
}
