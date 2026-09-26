import { Eye, EyeOff } from 'lucide-react'
import { Controller, type Control } from 'react-hook-form'
import { Combobox } from '@/components/shared/Combobox'
import { USER_ROLE_UUIDS } from '@/enums'
import type { UserEditFormValues } from '../schemas/userEdit'
import { CheckboxCard } from './CheckboxCard'

/** Rôles proposés, dans l'ordre du Vue (UUID fixes de la base). */
const ROLE_OPTIONS = [
  { value: USER_ROLE_UUIDS.ADMINISTRATEUR, label: 'Administrateur' },
  { value: USER_ROLE_UUIDS.MECANICIEN, label: 'Mécanicien' },
  { value: USER_ROLE_UUIDS.UTILISATEUR, label: 'Utilisateur' },
]

type UserEditAccessFieldsProps = {
  control: Control<UserEditFormValues>
  disabled: boolean
}

/** Rôle, compte actif, permission couchette et visibilité dans les listes admin. */
export function UserEditAccessFields({ control, disabled }: UserEditAccessFieldsProps) {
  return (
    <>
      <Controller
        name="roleUuid"
        control={control}
        render={({ field: { value, onChange, ...field } }) => (
          <Combobox
            {...field}
            value={value}
            onValueChange={onChange}
            label="Rôle"
            options={ROLE_OPTIONS}
            placeholder="Sélectionner un rôle..."
            disabled={disabled}
            searchable={false}
            clearable
          />
        )}
      />

      <div className="space-y-3">
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <CheckboxCard
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              label="Compte actif"
              description="L'utilisateur peut se connecter"
            />
          )}
        />
        <Controller
          name="isCouchette"
          control={control}
          render={({ field }) => (
            <CheckboxCard
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              label="Permission couchette"
              description="Permet de déclarer des couchettes"
            />
          )}
        />
        <Controller
          name="isVisible"
          control={control}
          render={({ field }) => (
            <CheckboxCard
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              label={
                <span className="flex items-center gap-1.5">
                  {field.value ? (
                    <Eye className="size-3.5 text-muted-foreground" />
                  ) : (
                    <EyeOff className="size-3.5 text-muted-foreground" />
                  )}
                  Visible dans les services et le planning
                </span>
              }
              description="Un utilisateur masqué n'apparaît plus dans le tableau de bord des services, le planning, les heures, les signatures et les véhicules. Il reste visible dans la liste des utilisateurs et peut toujours utiliser l'application."
            />
          )}
        />
      </div>
    </>
  )
}
