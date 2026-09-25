import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type HoursSearchInputProps = Omit<ComponentProps<typeof Input>, 'type'>

/** Champ de recherche avec loupe (Heures, Contrats, Export). */
export function HoursSearchInput({ className, ...props }: HoursSearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" className="pl-9" {...props} />
    </div>
  )
}
