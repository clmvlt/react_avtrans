import { useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import type { HoursPeriodController } from '../../hooks/useHoursPeriod'
import { FIRST_SELECTABLE_YEAR } from '../../lib/hoursPeriod'
import { PeriodNavigatorShell } from './PeriodNavigatorShell'

type YearNavigatorProps = {
  controller: HoursPeriodController
}

/**
 * Navigation par année. Un clic sur l'année fait apparaître un champ numérique pour la saisir ;
 * chaque frappe met la période à jour, comme le `v-model.number` du Vue.
 */
export function YearNavigator({ controller }: YearNavigatorProps) {
  const { state, marks } = controller
  const inputRef = useRef<HTMLInputElement>(null)
  // Texte en cours de saisie (le champ peut être vide le temps d'une frappe)
  const [draft, setDraft] = useState<string | null>(null)

  const focusInput = () => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }

  return (
    <PeriodNavigatorShell
      onPrevious={controller.previousYear}
      previousLabel="Année précédente"
      onNext={controller.nextYear}
      nextLabel="Année suivante"
      nextDisabled={state.year >= marks.currentYear}
      withTitles
      currentLabel="Année actuelle"
      onCurrent={controller.goToCurrentYear}
    >
      <div
        className="relative flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1 hover:bg-accent"
        onClick={focusInput}
      >
        <span className="font-semibold text-foreground">{state.year}</span>
        <Calendar className="size-3 text-muted-foreground" />
        <input
          ref={inputRef}
          type="number"
          aria-label="Année"
          className="absolute inset-0 mx-auto w-[90px] rounded-md border-2 border-primary bg-background p-2 text-center text-lg font-semibold text-foreground opacity-0 focus:z-10 focus:opacity-100"
          value={draft ?? String(state.year)}
          min={FIRST_SELECTABLE_YEAR}
          max={marks.currentYear}
          onChange={(event) => {
            setDraft(event.target.value)
            const year = event.target.valueAsNumber
            if (!Number.isNaN(year)) controller.setYear(year)
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
    </PeriodNavigatorShell>
  )
}
