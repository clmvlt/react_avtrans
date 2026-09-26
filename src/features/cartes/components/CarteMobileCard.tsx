import { CreditCard, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CarteDTO } from '@/models'
import type { RevealedSecrets } from '../hooks/useRevealedSecrets'
import { maskCardNumber, maskCode } from '../lib/cartes'
import { CarteExpiration } from './CarteExpiration'
import { CarteSecretValue } from './CarteSecretValue'

type CarteMobileCardProps = {
  carte: CarteDTO
  /** Toutes les cartes chargées (recherche du numéro révélé, B-30). */
  cartes: CarteDTO[]
  secrets: RevealedSecrets
  onEdit: (carte: CarteDTO) => void
  onDelete: (carte: CarteDTO) => void
}

/** Carte d'une carte (vue mobile) : numéro, code, expiration, type et titulaire. */
export function CarteMobileCard({
  carte,
  cartes,
  secrets,
  onEdit,
  onDelete,
}: CarteMobileCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CreditCard className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-foreground">{carte.nom}</span>
            {carte.description && (
              <span className="text-sm text-muted-foreground">{carte.description}</span>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Actions de la carte">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => onEdit(carte)}>
              <Pencil className="size-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onDelete(carte)}>
              <Trash2 className="size-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Numéro</span>
          <CarteSecretValue
            compact
            value={maskCardNumber(carte.numero, cartes, secrets.revealedNumeros)}
            revealed={secrets.isNumeroRevealed(carte.uuid)}
            onToggle={() => secrets.toggleNumero(carte.uuid)}
            secretLabel="numéro"
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Code</span>
          <CarteSecretValue
            compact
            value={maskCode(carte.code, carte.uuid, secrets.revealedCodes)}
            revealed={secrets.isCodeRevealed(carte.uuid)}
            showToggle={!!carte.code}
            onToggle={() => secrets.toggleCode(carte.uuid)}
            secretLabel="code"
          />
        </div>
      </div>

      {carte.dateExpiration && (
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Expiration</span>
            <CarteExpiration compact dateExpiration={carte.dateExpiration} />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {carte.typeCarte && <Badge variant="secondary">{carte.typeCarte.nom}</Badge>}
        {carte.user ? (
          <span className="text-sm text-foreground">
            {carte.user.firstName} {carte.user.lastName}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground italic">Non assignée</span>
        )}
      </div>
    </div>
  )
}
