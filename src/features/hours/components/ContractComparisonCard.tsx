import type { ReactNode } from 'react'
import { UserIdentity } from '@/components/shared/UserIdentity'
import { cn } from '@/lib/utils'
import {
  formatContractHours,
  formatDifference,
  formatPercentage,
  getDifferenceClass,
  getPercentageClass,
  type ContractRow,
} from '../lib/contractFormat'
import { ContractProgressBar } from './ContractProgressBar'

type ContractComparisonCardProps = {
  row: ContractRow
}

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg bg-muted/50 p-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

/** Carte mobile : contrat, heures effectuées, écart, réalisation, jours et moyenne. */
export function ContractComparisonCard({ row }: ContractComparisonCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <UserIdentity user={row.user} showEmail={false}>
        {row.heureContrat != null ? (
          <span className="text-xs text-muted-foreground">Contrat : {row.heureContrat}h/mois</span>
        ) : (
          <span className="text-xs text-muted-foreground italic">Pas de contrat défini</span>
        )}
      </UserIdentity>

      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <Tile label="Effectuées">
          <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
            {formatContractHours(row.heuresEffectuees)}
          </p>
        </Tile>
        <Tile label="Contrat">
          <p className="text-lg font-bold text-foreground">
            {row.heureContrat != null ? formatContractHours(row.heureContrat) : '-'}
          </p>
        </Tile>
        <Tile label="Différence">
          <p className={cn('text-lg font-bold', getDifferenceClass(row.difference))}>
            {formatDifference(row.difference)}
          </p>
        </Tile>
        <Tile label="Réalisation">
          <p className={cn('text-lg font-bold', getPercentageClass(row.pourcentageRealisation))}>
            {formatPercentage(row.pourcentageRealisation)}
          </p>
        </Tile>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <Tile label="Jours travaillés">
          <p className="text-sm font-semibold text-foreground">
            {row.joursTravailles}
            <span className="font-normal text-muted-foreground"> / {row.joursOuvres}</span>
          </p>
        </Tile>
        <Tile label="Absences">
          <p className="text-sm font-semibold text-foreground">{row.joursAbsence}j</p>
        </Tile>
        <Tile label="Moyenne / jour">
          <p className="text-sm font-semibold text-foreground">
            {row.moyenneHeuresParJour != null ? formatContractHours(row.moyenneHeuresParJour) : '-'}
          </p>
        </Tile>
      </div>

      {row.heureContrat != null && row.heureContrat > 0 && (
        <ContractProgressBar percentage={row.pourcentageRealisation} className="mt-3 h-2 w-full" />
      )}
    </div>
  )
}
