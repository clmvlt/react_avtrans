export type IosStep = {
  title: string
  /** Suite de la phrase après le titre (commence par une espace) */
  description: string
  link?: string
  linkLabel?: string
}

/** Étapes d'installation via TestFlight (carte iOS de /download). */
export const IOS_STEPS: IosStep[] = [
  {
    title: 'Téléchargez TestFlight',
    description: " depuis l'App Store si ce n'est pas déjà fait",
    link: 'https://apps.apple.com/app/testflight/id899247664',
    linkLabel: "Ouvrir l'App Store",
  },
  { title: 'Ouvrez TestFlight', description: ' sur votre iPhone ou iPad' },
  {
    title: 'Appuyez sur le bouton ci-dessous',
    description: ' pour rejoindre le programme de test',
  },
  { title: "Installez l'application", description: ' AVTRANS Pointage depuis TestFlight' },
]

/** Invitation TestFlight de l'application */
export const TESTFLIGHT_JOIN_URL = 'https://testflight.apple.com/join/cGHBQbTh'
