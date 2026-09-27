import { EllipsisVertical, Eye, History, Trash2 } from 'lucide-react'
import { UserAvatar } from '@/components/shared/UserAvatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
 * Boutons « Voir », « Historique », « Supprimer » à partir de `sm` ; en dessous, menu « ⋮ » aux
 * mêmes entrées libellées. Sans signature, seul l'historique est proposé.
 */
function SignatureRowActions({
  entry,
  onView,
  onHistory,
  onDelete,
}: Omit<SignaturesTableProps, 'entries'> & { entry: SignatureUserEntry }) {
  const hasSignature = Boolean(entry.lastSignature)

  return (
    <>
      <div className="flex justify-end gap-1.5 max-sm:hidden">
        {hasSignature && (
          <Button type="button" variant="outline" size="sm" onClick={() => onView(entry)}>
            <Eye className="size-3.5" />
            Voir
          </Button>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={() => onHistory(entry)}>
          <History className="size-3.5" />
          Historique
        </Button>
        {hasSignature && (
          <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(entry)}>
            <Trash2 className="size-3.5" />
            Supprimer
          </Button>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="sm:hidden"
            aria-label={`Actions pour ${entry.user.firstName ?? ''} ${entry.user.lastName ?? ''}`}
          >
            <EllipsisVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          {hasSignature && (
            <DropdownMenuItem onSelect={() => onView(entry)}>
              <Eye className="size-4" />
              Voir la signature
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onSelect={() => onHistory(entry)}>
            <History className="size-4" />
            Historique
          </DropdownMenuItem>
          {hasSignature && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(entry)}>
                <Trash2 className="size-4" />
                Supprimer la signature
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

/**
 * Table responsive des signatures (Signatures.vue) : rôle à partir de `md`, date et heures à
 * partir de `sm` (en dessous, sous le nom) ; actions en menu « ⋮ » sur téléphone.
 * Seule la dernière signature est consultable et supprimable ici.
 */
export function SignaturesTable({ entries, onView, onHistory, onDelete }: SignaturesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Utilisateurs ({entries.length})</TableHead>
            <TableHead className="hidden md:table-cell">Rôle</TableHead>
            <TableHead className="hidden sm:table-cell">Dernière signature</TableHead>
            <TableHead className="hidden sm:table-cell sm:text-center">Heures signées</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
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
                  <SignatureRowActions
                    entry={entry}
                    onView={onView}
                    onHistory={onHistory}
                    onDelete={onDelete}
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
