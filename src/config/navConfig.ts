import type { LucideIcon } from 'lucide-react'
import { UserRole } from '@/enums'
import {
  BedDouble,
  CalendarDays,
  CalendarX2,
  Car,
  Clock,
  Coins,
  CreditCard,
  FileUp,
  History,
  ListChecks,
  Package,
  PenLine,
  Scale,
  Smartphone,
  Timer,
  UserCheck,
  Users,
  Wrench,
} from 'lucide-react'

/**
 * Lien de navigation avec ses conditions d'accès
 */
export interface NavLinkConfig {
  to: string
  label: string
  /** Libellé court de la barre d'onglets mobile (par défaut `label`) */
  shortLabel?: string
  lucideIcon: LucideIcon
  requiredRoles?: UserRole[]
  requiredPermissions?: string[]
  /** If set, only users with one of these emails can see this link */
  requiredEmails?: string[]
}

/**
 * Section de la barre latérale (titre vide : liens sans en-tête, en haut du menu)
 */
export interface NavSectionConfig {
  title: string
  links: NavLinkConfig[]
}

const ADMIN = [UserRole.ADMINISTRATEUR]
const ADMIN_OR_MECHANIC = [UserRole.ADMINISTRATEUR, UserRole.MECANICIEN]
const USER_OR_ADMIN = [UserRole.UTILISATEUR, UserRole.ADMINISTRATEUR]

/**
 * Navigation de l'application authentifiée : une seule source pour la barre latérale, la barre
 * d'onglets mobile (section « Mon espace ») et le fil d'Ariane. Les liens sont filtrés par rôle
 * (vue utilisateur comprise, voir usePermissions) ; une section sans lien visible disparaît.
 */
export const navSections: NavSectionConfig[] = [
  {
    title: '',
    links: [
      { to: '/todos', label: 'À faire', lucideIcon: ListChecks, requiredRoles: ADMIN_OR_MECHANIC },
    ],
  },
  {
    title: 'Mon espace',
    links: [
      { to: '/pointage', label: 'Pointage', lucideIcon: Timer, requiredRoles: USER_OR_ADMIN },
      {
        to: '/myabsences',
        label: 'Mes absences',
        shortLabel: 'Absences',
        lucideIcon: CalendarX2,
        requiredRoles: USER_OR_ADMIN,
      },
      {
        to: '/myacomptes',
        label: 'Mes acomptes',
        shortLabel: 'Acomptes',
        lucideIcon: Coins,
        requiredRoles: USER_OR_ADMIN,
      },
      {
        to: '/mycouchettes',
        label: 'Mes couchettes',
        shortLabel: 'Couchettes',
        lucideIcon: BedDouble,
        requiredRoles: USER_OR_ADMIN,
        requiredPermissions: ['couchette'],
      },
    ],
  },
  {
    title: 'Personnel',
    links: [
      { to: '/users', label: 'Utilisateurs', lucideIcon: Users, requiredRoles: ADMIN },
      { to: '/services', label: 'Présences', lucideIcon: UserCheck, requiredRoles: ADMIN },
      { to: '/planning', label: 'Planning', lucideIcon: CalendarDays, requiredRoles: ADMIN },
      { to: '/absences', label: 'Absences', lucideIcon: CalendarX2, requiredRoles: ADMIN },
      { to: '/acomptes', label: 'Acomptes', lucideIcon: Coins, requiredRoles: ADMIN },
      { to: '/couchettes', label: 'Couchettes', lucideIcon: BedDouble, requiredRoles: ADMIN },
    ],
  },
  {
    title: 'Heures',
    links: [
      { to: '/heures', label: 'Heures travaillées', lucideIcon: Clock, requiredRoles: ADMIN },
      { to: '/contract-hours', label: 'Heures contrat', lucideIcon: Scale, requiredRoles: ADMIN },
      {
        to: '/journal-pointages',
        label: 'Journal des pointages',
        lucideIcon: History,
        requiredRoles: ADMIN,
      },
      { to: '/signatures', label: 'Signatures', lucideIcon: PenLine, requiredRoles: ADMIN },
      { to: '/export-hours', label: 'Export des heures', lucideIcon: FileUp, requiredRoles: ADMIN },
    ],
  },
  {
    title: 'Flotte',
    links: [
      { to: '/vehicules', label: 'Véhicules', lucideIcon: Car, requiredRoles: ADMIN_OR_MECHANIC },
      {
        to: '/entretiens',
        label: 'Entretiens',
        lucideIcon: Wrench,
        requiredRoles: ADMIN_OR_MECHANIC,
      },
      { to: '/stock', label: 'Stock', lucideIcon: Package, requiredRoles: ADMIN_OR_MECHANIC },
      { to: '/cartes', label: 'Cartes', lucideIcon: CreditCard, requiredRoles: ADMIN },
    ],
  },
  {
    title: 'Application',
    links: [
      {
        to: '/app-versions',
        label: "Versions de l'app",
        lucideIcon: Smartphone,
        requiredEmails: ['clementveillet@gmail.com'],
      },
    ],
  },
]

/** Section des pages personnelles : barre d'onglets mobile des utilisateurs */
export const MY_SPACE_SECTION_TITLE = 'Mon espace'
