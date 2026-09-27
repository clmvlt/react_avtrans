import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const pageContainerVariants = cva(
  'mx-auto flex w-full flex-col gap-6 px-4 py-5 sm:px-6 md:py-6 lg:px-8',
  {
    variants: {
      size: {
        /** Formulaires, profil, pages de lecture */
        sm: 'max-w-3xl',
        /** Pages personnelles (listes de cartes) */
        md: 'max-w-5xl',
        /** Listes et tableaux d'administration */
        lg: 'max-w-7xl',
        /** Planning, vues avec panneau latéral */
        full: 'max-w-none',
      },
    },
    defaultVariants: { size: 'lg' },
  },
)

type PageContainerProps = ComponentProps<'div'> & VariantProps<typeof pageContainerVariants>

/**
 * Conteneur d'une page protégée : largeur maximale, marges et espacement vertical communs.
 * Contient le `PageHeader` puis le contenu.
 *
 * @example
 * <PageContainer size="md">
 *   <PageHeader title="Mes absences" actions={<Button>Nouvelle demande</Button>} />
 *   ...
 * </PageContainer>
 */
export function PageContainer({ size, className, ...props }: PageContainerProps) {
  return <div className={cn(pageContainerVariants({ size }), className)} {...props} />
}
