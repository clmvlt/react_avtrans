import { PageContainer } from '@/components/layout/PageContainer'
import { EmployeeDirectory } from '@/features/employee-hub/components/EmployeeDirectory'
import { EmployeeHub } from '@/features/employee-hub/components/EmployeeHub'
import { useHubSelection } from '@/features/employee-hub/hooks/useHubSelection'

/**
 * `/employes` (admin, hors parité) : fiche employé qui réunit tout ce qui concerne une personne
 * (journée, pointages, absences, acomptes, heures, signatures, couchettes, compte). Employé et
 * onglet sont dans l'URL (`?employe=…&onglet=…`). Pas de `PageHeader` : le sélecteur d'employé
 * occupe le coin supérieur gauche, à la demande du propriétaire ; le titre reste en `sr-only`.
 */
export default function EmployeeHubPage() {
  const { userUuid, rawTab, selectUser, clearUser, setTab } = useHubSelection()

  return (
    <PageContainer size="full">
      <h1 className="sr-only">Fiche employé</h1>
      {userUuid ? (
        <EmployeeHub
          key={userUuid}
          userUuid={userUuid}
          rawTab={rawTab}
          onTabChange={setTab}
          onSelectUser={selectUser}
          onClear={clearUser}
        />
      ) : (
        <EmployeeDirectory onSelect={selectUser} />
      )}
    </PageContainer>
  )
}
