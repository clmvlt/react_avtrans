/**
 * Changelog data with role-based visibility
 *
 * Role hierarchy:
 * - 'all': visible to everyone
 * - 'user': visible to user, mechanic, admin
 * - 'mechanic': visible to mechanic, admin only
 * - 'admin': visible to admin only
 */

export type ChangeRole = 'all' | 'user' | 'mechanic' | 'admin'
export type ChangeType = 'feature' | 'fix' | 'improvement'

export interface Change {
  role: ChangeRole
  type: ChangeType
  description: string
}

export interface ChangelogEntry {
  version: string
  date: string
  changes: Change[]
}

export const changelog: ChangelogEntry[] = [
  {
    version: '0.0.31',
    date: '2026-03-26',
    changes: [
      {
        role: 'admin',
        type: 'feature',
        description: 'Ajout des signatures dans les exports Excel.',
      },
    ],
  },
  {
    version: '0.0.29',
    date: '2026-03-17',
    changes: [
      {
        role: 'all',
        type: 'feature',
        description: "Menu rapide sur l'avatar (profil, thème, déconnexion).",
      },
      {
        role: 'all',
        type: 'improvement',
        description: "Redesign de la page de téléchargement de l'application.",
      },
      {
        role: 'user',
        type: 'improvement',
        description:
          "Meilleure gestion de la géolocalisation au pointage avec messages d'aide si la localisation est bloquée.",
      },
      {
        role: 'admin',
        type: 'fix',
        description:
          "Correction des couleurs d'absences sur le planning (correspondance avec la légende).",
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Affichage des demi-journées (AM/PM) sur le planning.',
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Carte avec marqueurs début (vert) et fin (violet) pour les services.',
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Affichage du nom et de la couleur du rôle sur le planning.',
      },
      {
        role: 'all',
        type: 'improvement',
        description: 'Refonte de la navigation avec menu latéral.',
      },
      {
        role: 'all',
        type: 'improvement',
        description: "Refonte visuelle des pages de connexion et d'inscription.",
      },
      {
        role: 'all',
        type: 'fix',
        description: 'Amélioration des modals : défilement, fermeture par clic extérieur.',
      },
      {
        role: 'user',
        type: 'feature',
        description: "Demande d'absence en demi-journée (matin ou après-midi).",
      },
      {
        role: 'user',
        type: 'feature',
        description: 'Complétion de profil (adresse, permis de conduire).',
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Fiche véhicule complète : fiche technique, assurance et équipements.',
      },
      {
        role: 'admin',
        type: 'feature',
        description: "Galerie d'images véhicule avec navigation et téléchargement.",
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Gestion des services par utilisateur et dernier véhicule utilisé.',
      },
      { role: 'admin', type: 'feature', description: 'Page heures contrat par employé.' },
      {
        role: 'admin',
        type: 'feature',
        description: 'Stock : prix unitaire HT et calcul du total par article.',
      },
      {
        role: 'admin',
        type: 'feature',
        description: "Date d'expiration des cartes avec alertes visuelles.",
      },
      {
        role: 'admin',
        type: 'feature',
        description: 'Notifications automatiques pour les cartes bientôt expirées.',
      },
      { role: 'admin', type: 'feature', description: 'Édition des absences côté admin.' },
      {
        role: 'admin',
        type: 'improvement',
        description: "Refonte des modals d'édition utilisateur.",
      },
    ],
  },
  {
    version: '0.0.26',
    date: '2026-02-04',
    changes: [
      { role: 'all', type: 'feature', description: 'Ajout du système de nouveautés.' },
      { role: 'all', type: 'feature', description: 'Mode sombre disponible.' },
      { role: 'all', type: 'fix', description: 'Correction de la navbar sur moible et pc.' },
      {
        role: 'admin',
        type: 'feature',
        description: 'Ajout du clic droit pour accéder aux actions contextuelles.',
      },
      { role: 'admin', type: 'feature', description: 'Adaptation complète du site sur mobile.' },
      {
        role: 'all',
        type: 'fix',
        description: 'Correction des heures qui continuaient de tourner en pause.',
      },
    ],
  },
]
