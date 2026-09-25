import type { ComponentProps } from 'react'
import { Combobox } from '@/components/shared/Combobox'
import { useUsersQuery } from '@/features/users/api/useUsersQuery'
import { selectableUsers } from '@/utils/userVisibility'

type EmployeeComboboxFieldProps = Omit<ComponentProps<typeof Combobox>, 'options' | 'label'> & {
  value: string
}

/**
 * Sélecteur « Employé * » des créations admin (absence, acompte) : liste GET /users (cache
 * partagé) limitée aux utilisateurs visibles, en gardant la valeur courante même si elle est
 * masquée (`selectableUsers`). Réutilisé par la feature acomptes.
 */
export function EmployeeComboboxField({ value, ...props }: EmployeeComboboxFieldProps) {
  const { data: users = [] } = useUsersQuery()
  const options = selectableUsers(users, [value])
    .filter((user) => user.uuid)
    .map((user) => ({ value: user.uuid!, label: `${user.firstName} ${user.lastName}` }))

  return (
    <Combobox
      label="Employé *"
      value={value}
      options={options}
      placeholder="Sélectionner un employé"
      searchPlaceholder="Rechercher un employé..."
      {...props}
    />
  )
}
