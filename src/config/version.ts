/**
 * Version de l'application en cours d'exécution.
 *
 * Source unique : `package.json` (incrémenté par `deploy/deploy.py`), injectée au build
 * par Vite (`define` dans vite.config.js). La même valeur est écrite dans `dist/version.json`,
 * ce qui permet au client de détecter un redéploiement (voir useVersionCheck).
 */
export const APP_VERSION: string = __APP_VERSION__
