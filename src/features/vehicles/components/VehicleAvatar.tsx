import type { ComponentProps } from 'react'
import { Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

type VehicleAvatarProps = ComponentProps<'div'> & {
  pictureUrl?: string | null
  alt?: string
  /** Classes de l'icône camion affichée sans photo (`size-5` par défaut). */
  iconClassName?: string
}

/**
 * Vignette d'un véhicule : sa photo, ou un camion blanc sur fond violet. La taille et l'arrondi
 * viennent de `className` (44 px dans la table, 48 px en mobile, 72 px dans le détail).
 */
export function VehicleAvatar({
  pictureUrl,
  alt,
  iconClassName,
  className,
  ...props
}: VehicleAvatarProps) {
  return (
    <div className={cn('size-11 shrink-0 overflow-hidden rounded-md', className)} {...props}>
      {pictureUrl ? (
        <img src={pictureUrl} alt={alt} className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-primary text-white">
          <Truck className={cn('size-5', iconClassName)} />
        </div>
      )}
    </div>
  )
}
