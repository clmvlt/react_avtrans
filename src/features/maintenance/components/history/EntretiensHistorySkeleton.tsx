import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type EntretiensHistorySkeletonProps = {
  /** Colonne « Véhicule » et immatriculation des cartes (/entretiens). */
  showVehicle: boolean
}

/** Chargement de l'historique : 4 cartes sous `md`, table de 8 lignes au-dessus. */
export function EntretiensHistorySkeleton({ showVehicle }: EntretiensHistorySkeletonProps) {
  return (
    <>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              {showVehicle ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              ) : (
                <Skeleton className="h-5 w-16 rounded-full" />
              )}
              <Skeleton className="size-6 rounded" />
            </div>
            <Skeleton className="h-4 w-28" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              {showVehicle && <TableHead>Véhicule</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Km</TableHead>
              <TableHead>Commentaire</TableHead>
              <TableHead>Mécanicien</TableHead>
              <TableHead className="text-right">Coût HT</TableHead>
              <TableHead className="text-center">Fichiers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 8 }, (_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                {showVehicle && (
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                )}
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-16" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-4 w-6" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )
}
