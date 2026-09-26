import { CreditCard } from 'lucide-react'
import { Empty } from '@/components/ui/empty'
import type { CarteDTO } from '@/models'
import type { RevealedSecrets } from '../hooks/useRevealedSecrets'
import { CarteMobileCard } from './CarteMobileCard'

type CarteMobileListProps = {
  /** Cartes filtrées par la recherche. */
  filteredCartes: CarteDTO[]
  cartes: CarteDTO[]
  secrets: RevealedSecrets
  onEdit: (carte: CarteDTO) => void
  onDelete: (carte: CarteDTO) => void
}

/** Vue mobile de la liste des cartes (masquée à partir de `md`). */
export function CarteMobileList({
  filteredCartes,
  cartes,
  secrets,
  onEdit,
  onDelete,
}: CarteMobileListProps) {
  return (
    <div className="space-y-3 md:hidden">
      <p className="text-sm text-muted-foreground">{filteredCartes.length} carte(s)</p>

      {filteredCartes.length === 0 && (
        <Empty className="gap-3 rounded-none p-0 py-12 text-muted-foreground md:p-0 md:py-12">
          <CreditCard className="size-10 opacity-50" />
          <p>Aucune carte configurée</p>
        </Empty>
      )}

      {filteredCartes.map((carte) => (
        <CarteMobileCard
          key={carte.uuid}
          carte={carte}
          cartes={cartes}
          secrets={secrets}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
