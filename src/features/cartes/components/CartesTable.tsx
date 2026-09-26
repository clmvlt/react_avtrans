import type { ColumnDef } from '@tanstack/react-table'
import { CreditCard } from 'lucide-react'
import { DataTable } from '@/components/shared/DataTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu'
import type { CarteDTO } from '@/models'
import type { RevealedSecrets } from '../hooks/useRevealedSecrets'
import { maskCardNumber, maskCode } from '../lib/cartes'
import { CarteExpiration } from './CarteExpiration'
import { CarteRowContextMenu } from './CarteRowContextMenu'
import { CarteSecretValue } from './CarteSecretValue'

type CartesTableProps = {
  /** Cartes filtrées par la recherche. */
  filteredCartes: CarteDTO[]
  /** Toutes les cartes chargées (recherche du numéro révélé, B-30). */
  cartes: CarteDTO[]
  secrets: RevealedSecrets
  onEdit: (carte: CarteDTO) => void
  onDelete: (carte: CarteDTO) => void
}

/** Table des cartes (desktop), sans tri ni pagination ; clic droit sur une ligne = menu. */
export function CartesTable({
  filteredCartes,
  cartes,
  secrets,
  onEdit,
  onDelete,
}: CartesTableProps) {
  const columns: ColumnDef<CarteDTO>[] = [
    {
      id: 'nom',
      header: `Cartes (${filteredCartes.length})`,
      cell: ({ row: { original: carte } }) => (
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CreditCard className="size-4" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{carte.nom}</span>
            {carte.description && (
              <span className="text-sm text-muted-foreground">{carte.description}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'numero',
      header: 'Numéro',
      cell: ({ row: { original: carte } }) => (
        <CarteSecretValue
          value={maskCardNumber(carte.numero, cartes, secrets.revealedNumeros)}
          revealed={secrets.isNumeroRevealed(carte.uuid)}
          onToggle={() => secrets.toggleNumero(carte.uuid)}
          secretLabel="numéro"
        />
      ),
    },
    {
      id: 'code',
      header: 'Code',
      cell: ({ row: { original: carte } }) => (
        <CarteSecretValue
          value={maskCode(carte.code, carte.uuid, secrets.revealedCodes)}
          revealed={secrets.isCodeRevealed(carte.uuid)}
          showToggle={!!carte.code}
          onToggle={() => secrets.toggleCode(carte.uuid)}
          secretLabel="code"
        />
      ),
    },
    {
      id: 'type',
      header: 'Type',
      cell: ({ row: { original: carte } }) =>
        carte.typeCarte ? (
          <Badge variant="secondary">{carte.typeCarte.nom}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: 'expiration',
      header: 'Expiration',
      cell: ({ row: { original: carte } }) =>
        carte.dateExpiration ? (
          <CarteExpiration dateExpiration={carte.dateExpiration} />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      id: 'utilisateur',
      header: 'Utilisateur',
      cell: ({ row: { original: carte } }) =>
        carte.user ? (
          <span className="font-medium text-foreground">
            {carte.user.firstName} {carte.user.lastName}
          </span>
        ) : (
          <span className="text-muted-foreground italic">Non assignée</span>
        ),
    },
    {
      id: 'actions',
      header: 'Actions',
      meta: { headerClassName: 'text-right', cellClassName: 'text-right' },
      cell: ({ row: { original: carte } }) => (
        <div className="flex flex-wrap justify-end gap-1.5">
          <Button
            type="button"
            variant="default"
            size="sm"
            title="Modifier"
            onClick={() => onEdit(carte)}
          >
            Modifier
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            title="Supprimer"
            onClick={() => onDelete(carte)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={filteredCartes}
      getRowId={(carte, index) => carte.uuid ?? String(index)}
      emptyState={<span className="text-muted-foreground">Aucune carte configurée</span>}
      className="hidden md:block"
      renderRow={(row, rowElement) => (
        <ContextMenu>
          <ContextMenuTrigger asChild>{rowElement}</ContextMenuTrigger>
          <CarteRowContextMenu
            carte={row.original}
            secrets={secrets}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </ContextMenu>
      )}
    />
  )
}
