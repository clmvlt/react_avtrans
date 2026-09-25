import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type FormSectionSeparatorProps = {
  children: ReactNode
  /** Fond du libellé : celui du conteneur (`bg-background` dans un dialog, `bg-card` dans une carte). */
  labelClassName?: string
}

/** Trait horizontal avec un titre de section centré, en majuscules (« Informations techniques »…). */
export function FormSectionSeparator({ children, labelClassName }: FormSectionSeparatorProps) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className={cn('bg-background px-2 text-muted-foreground', labelClassName)}>
          {children}
        </span>
      </div>
    </div>
  )
}
