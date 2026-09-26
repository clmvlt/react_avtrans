import type { ComponentProps } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type ListSearchInputProps = Omit<ComponentProps<typeof Input>, 'type' | 'onChange' | 'value'> & {
  value: string
  onValueChange: (value: string) => void
}

/** Barre de recherche des listes de cartes et de types (loupe à gauche). */
export function ListSearchInput({
  value,
  onValueChange,
  className,
  placeholder,
  ...props
}: ListSearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-9"
        {...props}
      />
    </div>
  )
}
