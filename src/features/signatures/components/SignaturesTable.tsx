import { Eye, History, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatSignatureDateTime } from '../lib/signatureFormatters'
import type { SignatureUserEntry } from '../lib/signatureResponses'

type SignaturesTableProps = {
  entries: SignatureUserEntry[]
  onView: (entry: SignatureUserEntry) => void
  onHistory: (entry: SignatureUserEntry) => void
  onDelete: (entry: SignatureUserEntry) => void
}

/**
 * Table responsive des signatures (Signatures.vue) : rôle à partir de `md`, date et heures à
 * partir de `sm` (en dessous, sous le nom) ; boutons icône seuls sur mobile.
 * Seule la dernière signature est consultable et supprimable ici.
 */
export function SignaturesTable({ entries, onView, onHistory, onDelete }: SignaturesTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateurs ({entries.length})</TableHead>
            <TableHead className="hidden md:table-cell">Rôle</TableHead>
            <TableHead className="hidden sm:table-cell">Date signature</TableHead>
            <TableHead className="hidden sm:table-cell sm:text-center">Heures</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucun utilisateur trouvé
              </TableCell>
            </TableRow>
          )}
          {entries.map((entry, index) => {
            const { user, lastSignature } = entry
            return (
              <TableRow key={user.uuid ?? index}>
                {/* Utilisateur */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-sm text-muted-foreground sm:hidden">
                        {lastSignature ? (
                          <>
                            {formatSignatureDateTime(lastSignature.date)} -{' '}
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {lastSignature.heuresSignees}h
                            </span>
                          </>
                        ) : (
                          'Aucune signature'
                        )}
                      </span>
                      <span className="hidden text-sm text-muted-foreground sm:block">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {/* Rôle (couleur dynamique du rôle) */}
                <TableCell className="hidden md:table-cell">
                  {user.role ? (
                    <span
                      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                      style={{ backgroundColor: user.role.color }}
                    >
                      {user.role.nom}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Aucun rôle</span>
                  )}
                </TableCell>

                {/* Date signature */}
                <TableCell className="hidden sm:table-cell">
                  {lastSignature ? (
                    <span className="text-sm text-muted-foreground">
                      {formatSignatureDateTime(lastSignature.date)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Aucune signature</span>
                  )}
                </TableCell>

                {/* Heures */}
                <TableCell className="hidden sm:table-cell sm:text-center">
                  {lastSignature ? (
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {lastSignature.heuresSignees}h
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {lastSignature && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="sm:size-auto sm:px-3"
                        title="Voir la signature"
                        aria-label="Voir la signature"
                        onClick={() => onView(entry)}
                      >
                        <Eye className="size-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Voir</span>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon-sm"
                      className="sm:size-auto sm:px-3"
                      title="Voir l'historique"
                      aria-label="Voir l'historique"
                      onClick={() => onHistory(entry)}
                    >
                      <History className="size-3.5 sm:mr-1.5" />
                      <span className="hidden sm:inline">Historique</span>
                    </Button>
                    {lastSignature && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon-sm"
                        className="sm:size-auto sm:px-3"
                        title="Supprimer la signature"
                        aria-label="Supprimer la signature"
                        onClick={() => onDelete(entry)}
                      >
                        <Trash2 className="size-3.5 sm:mr-1.5" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
