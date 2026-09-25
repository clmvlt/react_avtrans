import type { LucideIcon } from 'lucide-react'
import { UserRole } from '@/enums'
import {
  Car,
  Wrench,
  Users,
  CalendarX2,
  CalendarDays,
  Coins,
  BedDouble,
  Clock,
  Building2,
  CreditCard,
  BarChart3,
  UserCircle,
  ListChecks,
  Smartphone,
  Package,
  FileUp,
  PenLine,
  Download,
  Scale,
  History,
} from 'lucide-react'

/**
 * Interface pour un lien de navigation avec permissions
 */
export interface NavLinkConfig {
  to: string
  label: string
  icon?: string
  lucideIcon?: LucideIcon
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  /** If set, only users with one of these emails can see this link */
  requiredEmails?: string[]
}

/**
 * Interface pour une section de navigation
 */
export interface NavSectionConfig {
  title: string
  lucideIcon: LucideIcon
  links: NavLinkConfig[]
  /** Sections with the same group key share a single grid column */
  group?: string
}

/**
 * Configuration des liens de navigation principaux (navbar)
 */
export const mainNavLinks: NavLinkConfig[] = [
  // --- Pages accessibles aux MECANICIEN et ADMIN ---
  {
    to: '/vehicules',
    label: 'Véhicules',
    lucideIcon: Car,
    requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
  },
  {
    to: '/entretiens',
    label: 'Entretiens',
    lucideIcon: Wrench,
    requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
  },
  // --- Pages réservées aux ADMIN ---
  {
    to: '/users',
    label: 'Utilisateurs',
    lucideIcon: Users,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/absences',
    label: 'Absences',
    lucideIcon: CalendarX2,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/planning',
    label: 'Planning',
    lucideIcon: CalendarDays,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/acomptes',
    label: 'Acomptes',
    lucideIcon: Coins,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/heures',
    label: 'Heures',
    lucideIcon: Clock,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/contract-hours',
    label: 'Contrats',
    lucideIcon: Scale,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/services',
    label: 'Services',
    lucideIcon: Building2,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/cartes',
    label: 'Cartes',
    lucideIcon: CreditCard,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },
  {
    to: '/couchettes',
    label: 'Couchettes',
    lucideIcon: BedDouble,
    requiredRoles: [UserRole.ADMINISTRATEUR],
  },

  // --- Pages réservées aux UTILISATEUR uniquement ---
  {
    to: '/pointage',
    label: 'Pointage',
    lucideIcon: Clock,
    requiredRoles: [UserRole.UTILISATEUR],
  },
  {
    to: '/myabsences',
    label: 'Mes absences',
    lucideIcon: CalendarX2,
    requiredRoles: [UserRole.UTILISATEUR],
  },
  {
    to: '/myacomptes',
    label: 'Mes acomptes',
    lucideIcon: Coins,
    requiredRoles: [UserRole.UTILISATEUR],
  },
  {
    to: '/mycouchettes',
    label: 'Mes couchettes',
    lucideIcon: BedDouble,
    requiredRoles: [UserRole.UTILISATEUR],
    requiredPermissions: ['couchette'],
  },
]

/**
 * Configuration du panneau de navigation complet (full-nav)
 * Organisé en sections logiques
 */
export const fullNavSections: NavSectionConfig[] = [
  // Lien À faire (sans catégorie)
  {
    title: '',
    lucideIcon: ListChecks,
    links: [
      {
        to: '/todos',
        label: 'À faire',
        lucideIcon: ListChecks,
        requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
      },
    ],
  },

  // Section Mon espace (UTILISATEUR + ADMIN)
  {
    title: 'Mon espace',
    lucideIcon: UserCircle,
    links: [
      {
        to: '/pointage',
        label: 'Pointage',
        lucideIcon: Clock,
        requiredRoles: [UserRole.UTILISATEUR, UserRole.ADMINISTRATEUR],
      },
      {
        to: '/myabsences',
        label: 'Mes absences',
        lucideIcon: CalendarX2,
        requiredRoles: [UserRole.UTILISATEUR, UserRole.ADMINISTRATEUR],
      },
      {
        to: '/myacomptes',
        label: 'Mes acomptes',
        lucideIcon: Coins,
        requiredRoles: [UserRole.UTILISATEUR, UserRole.ADMINISTRATEUR],
      },
      {
        to: '/mycouchettes',
        label: 'Mes couchettes',
        lucideIcon: BedDouble,
        requiredRoles: [UserRole.UTILISATEUR, UserRole.ADMINISTRATEUR],
        requiredPermissions: ['couchette'],
      },
    ],
  },

  // Section Véhicules (ADMIN + MECANICIEN)
  {
    title: 'Véhicules',
    lucideIcon: Car,
    links: [
      {
        to: '/vehicules',
        label: 'Parc véhicules',
        lucideIcon: Car,
        requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
      },
      {
        to: '/entretiens',
        label: 'Entretiens',
        lucideIcon: Wrench,
        requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
      },
      {
        to: '/stock',
        label: 'Stock',
        lucideIcon: Package,
        requiredRoles: [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN],
      },
    ],
  },

  // Section Gestion (ADMIN)
  {
    title: 'Gestion',
    lucideIcon: BarChart3,
    links: [
      {
        to: '/users',
        label: 'Utilisateurs',
        lucideIcon: Users,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/services',
        label: 'Services',
        lucideIcon: Building2,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/planning',
        label: 'Planning',
        lucideIcon: CalendarDays,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/absences',
        label: 'Absences',
        lucideIcon: CalendarX2,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/couchettes',
        label: 'Couchettes',
        lucideIcon: BedDouble,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/acomptes',
        label: 'Acomptes',
        lucideIcon: Coins,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/cartes',
        label: 'Cartes',
        lucideIcon: CreditCard,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
    ],
  },

  // Section Heures (ADMIN)
  {
    title: 'Heures',
    lucideIcon: Clock,
    links: [
      {
        to: '/heures',
        label: 'Heures',
        lucideIcon: Clock,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/contract-hours',
        label: 'Heures contrat',
        lucideIcon: Scale,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/journal-pointages',
        label: 'Journal des pointages',
        lucideIcon: History,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/export-hours',
        label: 'Exportation',
        lucideIcon: FileUp,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
      {
        to: '/signatures',
        label: 'Signatures',
        lucideIcon: PenLine,
        requiredRoles: [UserRole.ADMINISTRATEUR],
      },
    ],
  },

  // Section Application (accessible à tous)
  {
    title: 'Application',
    lucideIcon: Smartphone,
    group: 'extra',
    links: [
      {
        to: '/app-versions',
        label: 'Versions App',
        lucideIcon: Smartphone,
        requiredEmails: ['clementveillet@gmail.com'],
      },
      {
        to: '/download',
        label: "Télécharger l'app",
        lucideIcon: Download,
        // Pas de requiredRoles = accessible à tous
      },
    ],
  },
]

/**
 * Liste plate pour compatibilité (deprecated)
 * @deprecated Utiliser fullNavSections à la place
 */
export const fullNavLinks: NavLinkConfig[] = fullNavSections.flatMap((section) => section.links)
