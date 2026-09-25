/**
 * Déclarations de types minimales pour Google Identity Services (GIS).
 * Script : https://accounts.google.com/gsi/client
 * Doc : https://developers.google.com/identity/gsi/web/reference/js-reference
 */

/** Réponse du callback after sign-in (contient l'ID token JWT). */
export interface GoogleCredentialResponse {
  /** L'ID token JWT à envoyer au backend. */
  credential: string
  /** Comment l'identifiant a été sélectionné (btn, one_tap, …). */
  select_by?: string
  /** Client ID utilisé. */
  clientId?: string
}

/** Configuration de google.accounts.id.initialize(). */
export interface GoogleIdConfiguration {
  client_id: string
  callback: (response: GoogleCredentialResponse) => void
  auto_select?: boolean
  cancel_on_tap_outside?: boolean
  ux_mode?: 'popup' | 'redirect'
  context?: 'signin' | 'signup' | 'use'
  itp_support?: boolean
  use_fedcm_for_prompt?: boolean
}

/** Configuration de google.accounts.id.renderButton(). */
export interface GoogleGsiButtonConfiguration {
  type?: 'standard' | 'icon'
  theme?: 'outline' | 'filled_blue' | 'filled_black'
  size?: 'large' | 'medium' | 'small'
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
  shape?: 'rectangular' | 'pill' | 'circle' | 'square'
  logo_alignment?: 'left' | 'center'
  width?: number | string
  locale?: string
}

/** Notification renvoyée par prompt() (One Tap). */
export interface GooglePromptMomentNotification {
  isDisplayMoment: () => boolean
  isDisplayed: () => boolean
  isNotDisplayed: () => boolean
  isSkippedMoment: () => boolean
  isDismissedMoment: () => boolean
  getNotDisplayedReason: () => string
  getSkippedReason: () => string
  getDismissedReason: () => string
  getMomentType: () => string
}

export interface GoogleAccountsId {
  initialize: (config: GoogleIdConfiguration) => void
  renderButton: (parent: HTMLElement, options: GoogleGsiButtonConfiguration) => void
  prompt: (listener?: (notification: GooglePromptMomentNotification) => void) => void
  cancel: () => void
  disableAutoSelect: () => void
}

export interface GoogleAccounts {
  id: GoogleAccountsId
}

declare global {
  interface Window {
    google?: {
      accounts: GoogleAccounts
    }
  }
}

export {}
