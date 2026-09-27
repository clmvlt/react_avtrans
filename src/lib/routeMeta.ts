import { matchPath } from 'react-router'
import { navSections } from '@/config/navConfig'

export type RouteMeta = {
  /** Nom de la page (fil d'Ariane, titre de l'onglet) */
  title: string
  /** Section de la barre latérale */
  section?: string
  /** Page parente (pages de détail ou de configuration absentes du menu) */
  parent?: { to: string; label: string }
}

/** Pages protégées absentes du menu latéral */
const EXTRA_ROUTES: { path: string; meta: RouteMeta }[] = [
  { path: '/profile', meta: { title: 'Mon profil' } },
  { path: '/notifications', meta: { title: 'Notifications' } },
  { path: '/add-to-homescreen', meta: { title: "Installer l'application" } },
  {
    path: '/absence-types',
    meta: {
      title: "Types d'absence",
      section: 'Personnel',
      parent: { to: '/absences', label: 'Absences' },
    },
  },
  {
    path: '/types-entretien',
    meta: {
      title: "Types d'entretien",
      section: 'Flotte',
      parent: { to: '/entretiens', label: 'Entretiens' },
    },
  },
  {
    path: '/types-cartes',
    meta: {
      title: 'Types de cartes',
      section: 'Flotte',
      parent: { to: '/cartes', label: 'Cartes' },
    },
  },
  {
    path: '/vehicules/:id',
    meta: {
      title: 'Fiche véhicule',
      section: 'Flotte',
      parent: { to: '/vehicules', label: 'Véhicules' },
    },
  },
  {
    path: '/entretiens/vehicule/:id',
    meta: {
      title: 'Entretiens du véhicule',
      section: 'Flotte',
      parent: { to: '/entretiens', label: 'Entretiens' },
    },
  },
  {
    path: '/users/:uuid/services',
    meta: {
      title: 'Pointages',
      section: 'Personnel',
      parent: { to: '/users', label: 'Utilisateurs' },
    },
  },
]

/** Titre, section et parent d'une page protégée, d'après la navigation ; `null` si inconnue. */
export function getRouteMeta(pathname: string): RouteMeta | null {
  for (const section of navSections) {
    const link = section.links.find((item) => matchPath(item.to, pathname))
    if (link) return { title: link.label, section: section.title || undefined }
  }
  return EXTRA_ROUTES.find((route) => matchPath(route.path, pathname))?.meta ?? null
}
