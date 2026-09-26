import { Clock, Phone, Smartphone } from 'lucide-react'
import { Controller, type Control } from 'react-hook-form'
import { InputField } from '@/components/shared/InputField'
import type { UserEditFormValues } from '../schemas/userEdit'

type UserEditContactFieldsProps = {
  control: Control<UserEditFormValues>
  disabled: boolean
}

/** Sections « Contrat » (heures mensuelles) et « Coordonnées » (téléphones). */
export function UserEditContactFields({ control, disabled }: UserEditContactFieldsProps) {
  return (
    <>
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Contrat</h4>
        <Controller
          name="heureContrat"
          control={control}
          render={({ field }) => (
            <InputField
              {...field}
              label="Heures mensuelles du contrat"
              type="number"
              placeholder="Ex: 151.67"
              disabled={disabled}
              icon={Clock}
              hint="Heures contractuelles par mois (ex: 151.67h)"
            />
          )}
        />
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Coordonnées</h4>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="telPersonnel"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Téléphone personnel"
                type="tel"
                placeholder="Ex: 06 12 34 56 78"
                autoComplete="off"
                disabled={disabled}
                icon={Smartphone}
              />
            )}
          />
          <Controller
            name="telPro"
            control={control}
            render={({ field }) => (
              <InputField
                {...field}
                label="Téléphone professionnel"
                type="tel"
                placeholder="Ex: 02 98 76 54 32"
                autoComplete="off"
                disabled={disabled}
                icon={Phone}
              />
            )}
          />
        </div>
      </div>
    </>
  )
}
