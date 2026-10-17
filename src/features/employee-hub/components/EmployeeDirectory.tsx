import { Users } from 'lucide-react'
import { ErrorState } from '@/components/shared/ErrorState'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { Skeleton } from '@/components/ui/skeleton'
import { useEmployeeDirectory } from '../hooks/useEmployeeDirectory'
import { groupDirectory } from '../lib/employeeDirectory'
import { DirectoryCard } from './DirectoryCard'
import { EmployeePicker } from './EmployeePicker'

type EmployeeDirectoryProps = {
  onSelect: (userUuid: string) => void
}

const GRID_CLASS =
  'grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:gap-4'

/**
 * Fiche employé sans employé choisi : le sélecteur en haut à gauche, puis tous les employés en
 * cartes, groupés par présence. Un clic ouvre la fiche ; la recherche passe par le sélecteur.
 */
export function EmployeeDirectory({ onSelect }: EmployeeDirectoryProps) {
  const { usersQuery, entries, receivedAt } = useEmployeeDirectory('')
  const groups = groupDirectory(entries)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <EmployeePicker
          entries={entries}
          selected={null}
          onSelect={onSelect}
          disabled={usersQuery.isPending}
          className="self-start"
        />
        <p className="text-sm text-muted-foreground">
          Choisissez la personne à gérer : pointages, absences, acomptes, heures… tout est réuni sur
          sa fiche.
        </p>
      </div>

      {usersQuery.isPending ? (
        <div className={GRID_CLASS} aria-busy="true">
          <span className="sr-only">Chargement des employés...</span>
          {Array.from({ length: 12 }, (_, index) => (
            <Skeleton key={index} className="h-44 rounded-xl" />
          ))}
        </div>
      ) : usersQuery.isError ? (
        <ErrorState
          message={usersQuery.error.message || 'Erreur lors du chargement des employés'}
          onRetry={() => void usersQuery.refetch()}
          isRetrying={usersQuery.isFetching}
        />
      ) : groups.length === 0 ? (
        <Empty className="rounded-xl border py-16">
          <EmptyMedia>
            <Users className="size-10 text-muted-foreground/60" />
          </EmptyMedia>
          <EmptyTitle>Aucun employé</EmptyTitle>
          <EmptyDescription>Aucun compte actif pour le moment.</EmptyDescription>
        </Empty>
      ) : (
        groups.map((group) => (
          <section key={group.presence} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {group.label} <span className="font-normal">({group.entries.length})</span>
            </h2>
            <div className={GRID_CLASS}>
              {group.entries.map((entry) => (
                <DirectoryCard
                  key={entry.user.uuid}
                  entry={entry}
                  receivedAt={receivedAt}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
